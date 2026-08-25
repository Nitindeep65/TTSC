/**
 * Real Database Driver for QueryCraft (Node.js & Next.js Serverless).
 * Supports live PostgreSQL schema introspection and read-only query execution via 'pg'.
 */

import { Client } from "pg"

export function isLocalhostUri(uri) {
  if (!uri) return false
  const lower = uri.toLowerCase()
  return (
    lower.includes("localhost") ||
    lower.includes("127.0.0.1") ||
    lower.includes("0.0.0.0") ||
    lower.includes("::1")
  )
}

/**
 * Introspects live PostgreSQL database schema and tables.
 */
export async function introspectPostgreSql(connectionUri) {
  if (!connectionUri || !connectionUri.trim()) {
    throw new Error("Connection URI is required.")
  }

  // Check if running on Vercel and trying to access private localhost
  if (isLocalhostUri(connectionUri) && process.env.VERCEL) {
    throw new Error(
      "Cannot connect to 'localhost' / '127.0.0.1' from Vercel Cloud Serverless functions. For cloud deployment, please use a cloud database (e.g. Supabase, Neon, AWS RDS, MongoDB Atlas) or run QueryCraft locally with 'npm run dev'."
    )
  }

  const client = new Client({
    connectionString: connectionUri,
    connectionTimeoutMillis: 7000,
    statement_timeout: 8000,
    ssl: connectionUri.includes("sslmode=require") || connectionUri.includes("supabase.co") || connectionUri.includes("neon.tech") || connectionUri.includes("amazonaws.com")
      ? { rejectUnauthorized: false }
      : false,
  })

  await client.connect()

  try {
    // 1. Fetch tables in public schema
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `)
    const tableNames = tablesRes.rows.map(r => r.table_name)

    // 2. Fetch columns
    const columnsRes = await client.query(`
      SELECT 
        table_name,
        column_name,
        data_type,
        udt_name,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `)

    // 3. Fetch primary keys
    const pkRes = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public';
    `)
    const pkMap = new Set(pkRes.rows.map(r => `${r.table_name}.${r.column_name}`))

    // 4. Fetch foreign keys
    const fkRes = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `)
    const fkMap = {}
    fkRes.rows.forEach(r => {
      fkMap[`${r.table_name}.${r.column_name}`] = `${r.foreign_table_name}(${r.foreign_column_name})`
    })

    // Group into structured table definitions
    const tableColumnsMap = {}
    tableNames.forEach(t => { tableColumnsMap[t] = [] })

    columnsRes.rows.forEach(col => {
      const t = col.table_name
      if (!tableColumnsMap[t]) tableColumnsMap[t] = []
      const isPk = pkMap.has(`${t}.${col.column_name}`)
      const fkRef = fkMap[`${t}.${col.column_name}`]

      tableColumnsMap[t].push({
        name: col.column_name,
        type: (col.data_type === 'USER-DEFINED' ? col.udt_name : col.data_type).toUpperCase(),
        is_primary_key: isPk,
        is_foreign_key: !!fkRef,
        references: fkRef || null,
        is_nullable: col.is_nullable === 'YES',
      })
    })

    // Generate Synthetic DDL for LLM Grounding
    let ddl = `-- Introspected Live Database Schema (${tableNames.length} tables)\n\n`
    tableNames.forEach(t => {
      ddl += `CREATE TABLE ${t} (\n`
      const colDefs = (tableColumnsMap[t] || []).map(c => {
        let def = `    ${c.name} ${c.type}`
        if (c.is_primary_key) def += ` PRIMARY KEY`
        if (c.references) def += ` REFERENCES ${c.references}`
        return def
      })
      ddl += colDefs.join(",\n")
      ddl += `\n);\n\n`
    })

    const structuredTables = tableNames.map(t => ({
      table_name: t,
      columns: tableColumnsMap[t] || [],
      description: `Live table introspected from database (${(tableColumnsMap[t] || []).length} columns)`,
    }))

    const hostMatch = connectionUri.match(/@([^:/]+)/)
    const host = hostMatch ? hostMatch[1] : "postgresql"
    const dbMatch = connectionUri.match(/\/([^/?]+)(?:\?|$)/)
    const database = dbMatch ? dbMatch[1] : "public"

    return {
      engine: "postgresql",
      host,
      database,
      tables_count: tableNames.length,
      tables: structuredTables,
      schema_sql: ddl,
      message: `Successfully connected to PostgreSQL on ${host} (${tableNames.length} tables introspected).`,
    }
  } finally {
    await client.end().catch(() => {})
  }
}

/**
 * Executes a live read-only SQL query on PostgreSQL database.
 */
export async function executePostgreSqlQuery(connectionUri, sqlQuery, limit = 50) {
  if (!connectionUri || !connectionUri.trim()) {
    throw new Error("No database connection URI provided.")
  }
  if (!sqlQuery || !sqlQuery.trim()) {
    throw new Error("No SQL query provided to execute.")
  }

  if (isLocalhostUri(connectionUri) && process.env.VERCEL) {
    throw new Error(
      "Cannot execute against 'localhost' from Vercel Cloud deployment. Please use a cloud database (Neon, Supabase, AWS RDS) or run QueryCraft locally with 'npm run dev'."
    )
  }

  // Safety check
  const disallowed = /\b(?:INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|REVOKE)\b/i
  if (disallowed.test(sqlQuery)) {
    throw new Error("Security Violation: Only read-only SELECT statements can be executed.")
  }

  const client = new Client({
    connectionString: connectionUri,
    connectionTimeoutMillis: 7000,
    statement_timeout: 8000,
    ssl: connectionUri.includes("sslmode=require") || connectionUri.includes("supabase.co") || connectionUri.includes("neon.tech") || connectionUri.includes("amazonaws.com")
      ? { rejectUnauthorized: false }
      : false,
  })

  await client.connect()
  const start = Date.now()

  try {
    // Enforce read-only transaction
    await client.query("SET TRANSACTION READ ONLY;")

    // Execute query
    const res = await client.query(sqlQuery)
    const elapsed = Date.now() - start

    const columns = res.fields ? res.fields.map(f => f.name) : []
    const rows = res.rows || []

    return {
      columns,
      rows,
      row_count: rows.length,
      execution_time_ms: Math.round(elapsed * 10) / 10,
      was_healed: false,
    }
  } finally {
    await client.end().catch(() => {})
  }
}

/**
 * Executes PostgreSQL EXPLAIN Plan.
 */
export async function explainPostgreSqlQuery(connectionUri, sqlQuery) {
  if (!connectionUri || !connectionUri.trim()) {
    throw new Error("No database connection URI provided.")
  }

  if (isLocalhostUri(connectionUri) && process.env.VERCEL) {
    throw new Error("EXPLAIN on 'localhost' requires running locally with 'npm run dev'.")
  }

  const client = new Client({
    connectionString: connectionUri,
    connectionTimeoutMillis: 7000,
    statement_timeout: 8000,
    ssl: connectionUri.includes("sslmode=require") || connectionUri.includes("supabase.co") || connectionUri.includes("neon.tech") || connectionUri.includes("amazonaws.com")
      ? { rejectUnauthorized: false }
      : false,
  })

  await client.connect()

  try {
    await client.query("SET TRANSACTION READ ONLY;")
    const cleanSql = sqlQuery.trim().replace(/;+$/, "")
    const res = await client.query(`EXPLAIN (FORMAT JSON, COSTS TRUE, VERBOSE TRUE) ${cleanSql}`)
    const plan = res.rows?.[0]?.["QUERY PLAN"]?.[0] || {}
    const planNode = plan.Plan || {}

    const totalCost = planNode["Total Cost"] || 0
    const planRows = planNode["Plan Rows"] || 0
    const nodeType = planNode["Node Type"] || "Query Plan"

    const isSeqScan = JSON.stringify(plan).includes("Seq Scan")
    const performanceRating = totalCost < 60 ? "fast" : totalCost < 300 ? "moderate" : "heavy"

    return {
      total_cost: totalCost,
      plan_rows: planRows,
      performance_rating: performanceRating,
      has_seq_scan: isSeqScan,
      scan_details: isSeqScan ? ["Sequential scan detected on unindexed table filter."] : ["Index-backed lookup or lightweight sequential scan."],
      index_recommendations: isSeqScan ? ["CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_query_filter ON table_name(column_name);"] : [],
      plan_tree: planNode,
    }
  } finally {
    await client.end().catch(() => {})
  }
}
