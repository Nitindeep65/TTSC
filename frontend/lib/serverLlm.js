/**
 * Universal Serverless LLM Engine for QueryCraft (Vercel & Node.js).
 * Directly invokes Llama 3.1 70B Instruct via NVIDIA NIM (or OpenAI / Groq)
 * with zero-hallucination schema grounding, clarification detection, and safe SQL compilation.
 */

export const LIVE_DATABASE_SCHEMA_SQL = `-- Cloud PostgreSQL Schema (Supabase / Neon / AWS RDS)

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'customer', -- 'customer', 'admin', 'merchant'
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    attributes JSONB,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'pending', 'processing', 'completed', 'cancelled', 'refunded'
    shipping_address JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- 'credit_card', 'paypal', 'stripe', 'bank_transfer'
    status VARCHAR(50) NOT NULL, -- 'succeeded', 'pending', 'failed', 'refunded'
    transaction_ref VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`

export function detectVisualIntent(prompt) {
  const p = (prompt || "").toLowerCase()
  const visualKeywords = [
    "chart", "graph", "plot", "visualize", "visualization",
    "trend", "timeline", "breakdown", "distribution", "compare",
    "bar chart", "line chart", "pie chart", "area chart", "donut", "by category"
  ]
  const shouldVisualize = visualKeywords.some(kw => p.includes(kw))
  
  let recommendedChart = "table"
  if (p.includes("line") || p.includes("trend") || p.includes("over time") || p.includes("daily") || p.includes("monthly")) {
    recommendedChart = "line"
  } else if (p.includes("pie") || p.includes("donut") || p.includes("share") || p.includes("proportion")) {
    recommendedChart = "pie"
  } else if (p.includes("area")) {
    recommendedChart = "area"
  } else if (p.includes("bar") || p.includes("breakdown") || p.includes("compare") || p.includes("by category")) {
    recommendedChart = "bar"
  } else if (shouldVisualize) {
    recommendedChart = "bar"
  }

  return {
    should_visualize: shouldVisualize,
    recommended_chart: recommendedChart,
    title: "Query Visualization"
  }
}

export function generateClarificationChips(text) {
  const t = (text || "").toLowerCase()
  const chips = []
  if (t.includes("time") || t.includes("date") || t.includes("window") || t.includes("year") || t.includes("month") || t.includes("range")) {
    chips.push("Last 30 Days", "Calendar Year 2024", "All Time")
  }
  if (t.includes("status") || t.includes("completed") || t.includes("active") || t.includes("pending")) {
    chips.push("Completed Orders Only", "Active Users Only", "Include All Statuses")
  }
  if (t.includes("ranking") || t.includes("spend") || t.includes("metric") || t.includes("count") || t.includes("top")) {
    chips.push("Top 5 by Total Spend", "Top 10 by Order Count", "Order by Recent Date")
  }
  if (chips.length === 0) {
    chips.push("Yes, proceed with defaults", "Filter by last 30 days", "Top 5 results")
  }
  return Array.from(new Set(chips)).slice(0, 4)
}

export function validateAndEnforceSafety(sqlQuery) {
  if (!sqlQuery) return ""
  let query = sqlQuery.trim()

  const disallowedPatterns = [
    /\bINSERT\s+INTO\b/i,
    /\bUPDATE\s+\w+\s+SET\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bDROP\s+(?:TABLE|DATABASE|INDEX|VIEW|SCHEMA|COLLECTION)\b/i,
    /\bALTER\s+(?:TABLE|DATABASE|INDEX|VIEW|SCHEMA)\b/i,
    /\bTRUNCATE\b/i,
    /\bGRANT\b/i,
    /\bREVOKE\b/i,
    /\bEXEC\b/i,
    /\bEXECUTE\b/i,
    /\$out\b/i,
    /\$merge\b/i,
    /\.insertOne\(/i,
    /\.insertMany\(/i,
    /\.updateOne\(/i,
    /\.updateMany\(/i,
    /\.deleteOne\(/i,
    /\.deleteMany\(/i,
    /\.drop\(/i,
    /\bFLUSHALL\b/i,
    /\bFLUSHDB\b/i,
  ]

  for (const pattern of disallowedPatterns) {
    if (pattern.test(query)) {
      throw new Error(`Dangerous operation detected in generated query. Only read-only queries are permitted.`)
    }
  }

  const isNoSQL = /^\s*(?:db\.|SCAN\b|GET\b|HGETALL\b|LRANGE\b|SMEMBERS\b)/i.test(query)
  if (!isNoSQL) {
    const isPureScalarAgg = /^\s*SELECT\s+(?:COUNT|SUM|AVG|MIN|MAX)\(/i.test(query) && !/\bGROUP\s+BY\b/i.test(query)
    if (!isPureScalarAgg && !/\bLIMIT\s+\d+\b/i.test(query)) {
      if (query.endsWith(";")) {
        query = query.slice(0, -1).trim() + " LIMIT 50;"
      } else {
        query = query + " LIMIT 50;"
      }
    }
  }
  return query
}

export function sanitizeAndParseJson(rawText) {
  let text = (rawText || "").trim()
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
  }
  try {
    return JSON.parse(text)
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw e
  }
}

/**
 * Builds the LLM system prompt with live schema, rules, and grounding instructions.
 */
export function buildSystemPrompt(liveSchema) {
  const schema = liveSchema && liveSchema.trim() ? liveSchema : LIVE_DATABASE_SCHEMA_SQL

  return `You are an expert Universal Text-to-Database Clarification and Query Engine specializing in SQL (PostgreSQL, MySQL, Supabase, Neon, AWS RDS) and NoSQL Document/Key-Value environments (MongoDB, Redis, DynamoDB).

Your objective is to analyze user requests, evaluate conversational context, generate safe, optimized, production-ready queries (PostgreSQL SQL by default, or MongoDB MQL / Redis commands if requested) based strictly on the live schema provided.

---

### INPUT CONTEXT PROVIDED
- LIVE DATABASE SCHEMA & COLLECTIONS:
${schema}

---

### CORE EVALUATION RULES

1. SCHEMA & COLLECTION GROUNDING (ZERO HALLUCINATION):
   - Only reference tables, columns, or collections/fields explicitly present in the provided schema.
   - NEVER invent or guess columns (such as "name", "role", "is_active", "metadata", "status") if they are not listed in the table's DDL above.
   - Respect data types (e.g., UUID, TIMESTAMPTZ, JSONB, BSON object types).

2. TYPO TOLERANCE & SPELL CORRECTION:
   - If the user makes a typographical spelling mistake in a table or column name (e.g. "counterpatis" for "counterparties", "contarcts" for "contracts", "usrs" for "users", "prodcts" for "products"), intelligently match and auto-correct it to the most similar table or column name in the provided schema.

3. DIRECT DATA RETRIEVAL & INSPECTION (ALWAYS GENERATE QUERY - status = "complete"):
   - For direct retrieval requests, record inspection, or table viewing requests (e.g., "provide data of users", "show all users", "bring all the users", "list products", "get recent orders", "show rows from users table", "get all customers"):
     * ALWAYS generate the query with status: "complete" immediately.
     * If the user did not specify distinct columns, you may use "SELECT * FROM <table> LIMIT 50;" or select ONLY the exact columns present in the schema definition for that table. Never guess non-existent columns.
     * Always apply a safe read-only LIMIT 50.

4. ERROR NOTICE RECOVERY & SELF-HEALING:
   - If the user prompt or session history mentions a database execution error (e.g. 'column "..." does not exist', 'relation "..." does not exist', 'syntax error', or 'Database Execution Notice'):
     * Treat this as an immediate query repair request.
     * Inspect the error and schema, immediately eliminate all invalid/missing columns in a single pass, or switch to "SELECT * FROM <table> LIMIT 50;" if the column structure is uncertain.
     * Set status: "complete" with the healed SQL query. Do NOT ask for clarification on an error message.

5. WHEN TO PAUSE FOR CLARIFICATION (status = "needs_clarification"):
   - ONLY set status to "needs_clarification" if the request is fundamentally ambiguous and cannot be fulfilled with standard baseline filters (e.g., "calculate our business churn KPI" when no churn formula is defined, or "are we profitable?" with no financial tables).
   - If the request can be fulfilled with reasonable default assumptions (e.g. recent records, default status), generate the query with status: "complete" and state your assumptions in the "explanation".

6. SAFETY & RESOURCE CONSTRAINTS:
   - READ-ONLY ENFORCEMENT: Output ONLY SELECT statements for SQL, or read-only find() / aggregate() for MongoDB. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.
   - RESOURCE PROTECTION: Apply an explicit LIMIT (default to 50 if unspecified) on open-ended queries.

---

### STRICT JSON OUTPUT FORMAT
Respond ONLY with a valid, raw JSON object matching this schema (no markdown formatting, no backticks, no code fences):

{
  "status": "complete" | "needs_clarification",
  "message": "Friendly confirmation message or targeted clarification question",
  "extracted_data": {
    "sql_query": "SELECT ... FROM ... LIMIT 50;",
    "tables_identified": ["table_or_collection_1"],
    "explanation": "1-2 sentence plain-English explanation of columns selected, joins, filters, and limits applied."
  } | null
}`
}

/**
 * Executes multi-turn clarification & query compilation via LLM.
 */
export async function executeLlmClarification({
  user_prompt,
  session_history = [],
  live_schema = null,
}) {
  const visualIntent = detectVisualIntent(user_prompt)

  const apiKey =
    process.env.NVIDIA_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "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"
  const baseUrl =
    process.env.NVIDIA_BASE_URL ||
    process.env.Base_url ||
    "https://integrate.api.nvidia.com/v1"
  const model =
    process.env.NVIDIA_MODEL ||
    process.env.model ||
    "meta/llama-3.1-70b-instruct"

  const systemPrompt = buildSystemPrompt(live_schema)
  const messages = [{ role: "system", content: systemPrompt }]

  for (const item of session_history) {
    const role = item.role
    const content = item.content || item.rawContent
    if ((role === "user" || role === "assistant") && content) {
      messages.push({ role, content: String(content) })
    }
  }

  messages.push({ role: "user", content: user_prompt })

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        max_tokens: 700,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`LLM provider returned status ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content || "{}"
    const parsed = sanitizeAndParseJson(rawContent)
    const extractedDataRaw = parsed.extracted_data || parsed

    const hasSql = !!(extractedDataRaw?.sql_query && typeof extractedDataRaw.sql_query === "string" && extractedDataRaw.sql_query.trim().length > 0)
    const status = (parsed.status === "complete" || hasSql) ? "complete" : "needs_clarification"
    const message = parsed.message || (status === "needs_clarification" ? "Could you please clarify your request?" : "Here is your SQL query.")

    if (status === "complete" && hasSql) {
      const safeSql = validateAndEnforceSafety(extractedDataRaw.sql_query)
      const tables = Array.isArray(extractedDataRaw.tables_identified)
        ? extractedDataRaw.tables_identified
        : []
      const explanation = extractedDataRaw.explanation || "Schema-grounded query with safe read-only LIMIT 50 protections."
      const dialect = /^\s*db\./i.test(safeSql) ? "mongodb" : "postgresql"

      return {
        status: "complete",
        message,
        options: [],
        extracted_data: {
          sql_query: safeSql,
          dialect,
          explanation,
          tables_identified: tables,
          tables_used: tables,
          visual_intent: visualIntent,
          visualization_recommendation: visualIntent.recommended_chart,
        },
        visual_intent: visualIntent,
      }
    } else {
      const chips = generateClarificationChips(message)
      return {
        status: "needs_clarification",
        message,
        options: chips,
        extracted_data: null,
        visual_intent: visualIntent,
      }
    }
  } catch (err) {
    console.warn("LLM Clarification API unavailable, invoking Dynamic Schema-Aware Fallback Engine:", err.message)
    return compileFallbackQuery({
      user_prompt,
      session_history,
      live_schema,
    })
  }
}
/**
 * Computes normalized Levenshtein similarity (0.0 to 1.0) between two strings with whitespace/delimiter collapsing.
 */
export function calculateStringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0
  const a = s1.toLowerCase().replace(/[\s_-]+/g, "")
  const b = s2.toLowerCase().replace(/[\s_-]+/g, "")
  if (a === b) return 1.0

  const lenA = a.length
  const lenB = b.length
  if (lenA === 0 || lenB === 0) return 0

  const matrix = Array.from({ length: lenA + 1 }, () => new Array(lenB + 1).fill(0))

  for (let i = 0; i <= lenA; i++) matrix[i][0] = i
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  const distance = matrix[lenA][lenB]
  const maxLen = Math.max(lenA, lenB)
  return 1 - distance / maxLen
}

/**
 * Finds the closest matching schema table for a potentially misspelled word or multi-word phrase.
 */
export function findClosestSchemaTable(candidateWord, schemaTables = [], threshold = 0.60) {
  if (!candidateWord || !schemaTables || schemaTables.length === 0) return null
  const word = candidateWord.toLowerCase().trim()

  let bestMatch = null
  let highestScore = 0

  for (const tbl of schemaTables) {
    const tableClean = tbl.toLowerCase().trim()
    const sim = calculateStringSimilarity(word, tableClean)
    if (sim > highestScore) {
      highestScore = sim
      bestMatch = tbl
    }
  }

  if (highestScore >= threshold) {
    return bestMatch
  }
  return null
}

export function extractTableNameFromPrompt(prompt, schemaTables = []) {
  if (!prompt) return null
  const p = prompt.trim().toLowerCase()
  const normalizedPrompt = p.replace(/[\s_-]+/g, "")

  // 1. Direct exact or normalized containment in schema tables
  for (const tbl of schemaTables) {
    const normTbl = tbl.toLowerCase().replace(/[\s_-]+/g, "")
    if (normalizedPrompt.includes(normTbl) || normalizedPrompt.includes(normTbl.replace(/s$/, ""))) {
      return tbl
    }
  }

  // 2. Tokenize prompt into words and check multi-word sliding window n-grams (up to 3 words)
  const words = p.split(/[^a-zA-Z0-9_]+/).filter(Boolean)
  const stopWords = new Set([
    "give", "show", "get", "bring", "fetch", "display", "provide", "select", "find",
    "list", "view", "render", "count", "how", "many", "all", "the", "in", "of", "to",
    "for", "me", "from", "table", "data", "records", "rows", "database", "please",
    "can", "you", "could", "i", "just", "need", "want", "no", "yes", "time", "filter"
  ])

  let bestMatch = null
  let highestScore = 0

  for (let n = 3; n >= 1; n--) {
    for (let i = 0; i <= words.length - n; i++) {
      const phraseWords = words.slice(i, i + n)
      if (phraseWords.every(w => stopWords.has(w))) continue
      const phrase = phraseWords.join(" ")

      for (const tbl of schemaTables) {
        const sim = calculateStringSimilarity(phrase, tbl)
        if (sim > highestScore) {
          highestScore = sim
          bestMatch = tbl
        }
      }
    }
  }

  // 3. Phrasal extraction with common conversational prefixes stripped
  const cleaned = p
    .replace(/^(?:please\s+)?(?:can\s+you\s+)?(?:could\s+you\s+)?(?:i\s+just\s+(?:simple\s+)?(?:need|want)\s+)?(?:give|show|get|bring|fetch|display|provide|select|find|list|view|render|count|how\s+many)\s+(?:me\s+)?(?:all\s+)?(?:the\s+)?(?:list\s+of\s+(?:all\s+)?(?:the\s+)?)?/i, "")
    .replace(/^(?:top|first|limit)\s+\d+\s+/i, "")
    .replace(/^all\s+(?:the\s+)?/i, "")
    .replace(/^list\s+of\s+(?:all\s+)?(?:the\s+)?/i, "")
    .replace(/^(?:the\s+)?/i, "")
    .replace(/\s+(?:table|data|records|rows|collection|info|items)$/i, "")
    .trim()

  if (cleaned) {
    for (const tbl of schemaTables) {
      const sim = calculateStringSimilarity(cleaned, tbl)
      if (sim > highestScore) {
        highestScore = sim
        bestMatch = tbl
      }
    }
  }

  // If match meets threshold against grounded schema, return it
  if (highestScore >= 0.55 && bestMatch) {
    return bestMatch
  }

  // If connected schema tables are provided, NEVER return an ungrounded hallucinated table
  if (schemaTables.length > 0) {
    return null
  }

  // Fallback if no schema is provided at all
  const firstWord = cleaned.split(/\s+/)[0]
  return firstWord || null
}

export function compileFallbackQuery({ user_prompt, session_history = [], live_schema = null }) {
  const schema = live_schema && live_schema.trim() ? live_schema : LIVE_DATABASE_SCHEMA_SQL
  const visualIntent = detectVisualIntent(user_prompt)

  const tableMatches = [...schema.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi)]
  const schemaTables = tableMatches.map(m => m[1].toLowerCase())

  let targetTable = extractTableNameFromPrompt(user_prompt, schemaTables)

  // If not found in current prompt, check previous history
  if (!targetTable && session_history?.length > 0) {
    for (let i = session_history.length - 1; i >= 0; i--) {
      const prev = session_history[i].content || session_history[i].rawContent || ""
      const tbl = extractTableNameFromPrompt(prev, schemaTables)
      if (tbl) {
        targetTable = tbl
        break
      }
    }
  }

  // If still not found and we have schema tables, fallback to the first table
  if (!targetTable && schemaTables.length > 0) {
    const p = (user_prompt || "").toLowerCase()
    if (p.includes("user") || p.includes("customer") || p.includes("account")) {
      targetTable = "users"
    } else if (p.includes("product") || p.includes("item") || p.includes("catalog")) {
      targetTable = "products"
    } else if (p.includes("order") || p.includes("sale") || p.includes("transaction")) {
      targetTable = "orders"
    } else if (schemaTables.length > 0) {
      targetTable = schemaTables[0]
    }
  }

  if (targetTable) {
    const allPrompts = [...session_history.map(m => m.content || m.rawContent || ""), user_prompt].filter(Boolean)
    const combinedText = allPrompts.join(" ").toLowerCase()
    let whereClauses = []

    if (combinedText.includes("last 7 days") || combinedText.includes("7 days")) {
      whereClauses.push("created_at >= NOW() - INTERVAL '7 days'")
    } else if (combinedText.includes("last 30 days") || combinedText.includes("30 days")) {
      whereClauses.push("created_at >= NOW() - INTERVAL '30 days'")
    } else if (combinedText.includes("2024") || combinedText.includes("year 2024")) {
      whereClauses.push("created_at >= '2024-01-01' AND created_at < '2025-01-01'")
    }

    if (combinedText.includes("completed")) {
      whereClauses.push("status = 'completed'")
    } else if (combinedText.includes("active")) {
      whereClauses.push("is_active = TRUE")
    }

    const whereStr = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : ""
    const isCount = /\b(?:count|how many|total count|number of)\b/i.test(combinedText)
    const limitMatch = combinedText.match(/\btop\s+(\d+)\b/i) || combinedText.match(/\blimit\s+(\d+)\b/i)
    const limitVal = limitMatch ? parseInt(limitMatch[1], 10) : 50

    const isNoSql = schema.includes("// LIVE INTROSPECTED MONGODB")
    const sql = isNoSql
      ? `db.${targetTable}.find(${whereClauses.length > 0 ? "{}" : "{}"}).limit(${limitVal})`
      : isCount
        ? `SELECT COUNT(*) AS total_count FROM ${targetTable}${whereStr};`
        : `SELECT * FROM ${targetTable}${whereStr} LIMIT ${limitVal};`

    return {
      status: "complete",
      message: isCount
        ? `Counting records in the ${targetTable} table:`
        : `Here is the query for retrieving records from the ${targetTable} table:`,
      options: [],
      extracted_data: {
        sql_query: sql,
        dialect: isNoSql ? "mongodb" : "postgresql",
        explanation: isCount
          ? `Calculates total count from ${targetTable}${whereClauses.length > 0 ? ` with filters (${whereClauses.join(", ")})` : ""}.`
          : `Retrieves records from ${targetTable}${whereClauses.length > 0 ? ` with filters: ${whereClauses.join(", ")}` : ""} with safe read-only LIMIT ${limitVal} protections.`,
        tables_identified: [targetTable],
        tables_used: [targetTable],
        visual_intent: visualIntent,
        visualization_recommendation: visualIntent.recommended_chart || "table",
      },
      visual_intent: visualIntent,
    }
  }

  // Graceful fallback for completely open-ended queries
  const chips = generateClarificationChips(user_prompt)
  return {
    status: "needs_clarification",
    message: `Which database table or records would you like to query for "${user_prompt}"? (Available: ${schemaTables.slice(0, 4).join(", ") || "users, products, orders"})`,
    options: chips.length > 0 ? chips : ["All Time", "Last 30 Days", "Top 10 Results"],
    extracted_data: null,
    visual_intent: visualIntent,
  }
}

/**
 * Standalone SQL Doctor diagnosis & self-healing via LLM.
 */
export async function executeLlmDiagnosis({
  error_message,
  failing_sql = "",
  live_schema = null,
  user_prompt = "",
}) {
  const apiKey =
    process.env.NVIDIA_API_KEY ||
    process.env.OPENAI_API_KEY ||
    "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"
  const baseUrl =
    process.env.NVIDIA_BASE_URL ||
    process.env.Base_url ||
    "https://integrate.api.nvidia.com/v1"
  const model =
    process.env.NVIDIA_MODEL ||
    process.env.model ||
    "meta/llama-3.1-70b-instruct"

  const schema = live_schema && live_schema.trim() ? live_schema : LIVE_DATABASE_SCHEMA_SQL

  const prompt = `You are an expert SQL Doctor and Critic Healer.
A query failed with the following runtime error:
ERROR: ${error_message}
FAILING QUERY:
${failing_sql}
USER INTENT: ${user_prompt || "N/A"}

DATABASE SCHEMA:
${schema}

DIAGNOSIS & HEALING INSTRUCTIONS:
1. Diagnose the exact root cause of the error (e.g. column name mismatch, invalid data type, missing GROUP BY, syntax error).
2. If a column error occurred (e.g. column "X" does not exist):
   - Compare EVERY column in the failing SQL query against the schema columns for that table.
   - Eliminate ALL non-existent columns in a SINGLE PASS (do NOT remove just one and leave others broken).
   - If all columns in the query were guessed or if the user asked to inspect all records, safely heal to "SELECT * FROM <table_name> LIMIT 50;".
3. Ensure the healed query is 100% valid PostgreSQL read-only SQL adhering strictly to the schema.

Respond ONLY with valid JSON:
{
  "diagnosis": "Clear 1-2 sentence explanation of the error cause and how it was fixed in a single pass",
  "healed_sql": "SELECT ... LIMIT 50;",
  "sqlstate_code": "42703 (or appropriate code)"
}`

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.05,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (res.ok) {
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || "{}"
      const parsed = sanitizeAndParseJson(raw)
      const rawHealed = parsed.healed_sql || parsed.sql_query || parsed.query || parsed.sql || (parsed.extracted_data && parsed.extracted_data.sql_query)
      if (rawHealed && rawHealed.trim() && rawHealed.trim().toLowerCase() !== failing_sql.trim().toLowerCase()) {
        const healed = validateAndEnforceSafety(rawHealed)
        return {
          original_sql: failing_sql,
          healed_sql: healed,
          diagnosis: parsed.diagnosis || "Query healed successfully against live schema.",
          sqlstate_code: parsed.sqlstate_code || "42703",
          can_execute: true,
        }
      }
    }
  } catch (err) {
    console.error("SQL Doctor LLM Error:", err)
  }

  // Programmatic fallback healing for column does not exist errors if LLM fails
  const colMatch = error_message.match(/column ["']?([^"'\s]+)["']? does not exist/i)
  const tblMatch = failing_sql.match(/\bFROM\s+([a-zA-Z0-9_]+)\b/i)
  if (colMatch && tblMatch) {
    const tableName = tblMatch[1]
    const fallbackHealed = `SELECT * FROM ${tableName} LIMIT 50;`
    return {
      original_sql: failing_sql,
      healed_sql: fallbackHealed,
      diagnosis: `Automatically repaired query by switching to universal table selection 'SELECT * FROM ${tableName} LIMIT 50;' to prevent column '${colMatch[1]}' mismatch.`,
      sqlstate_code: "42703",
      can_execute: true,
    }
  }

  return {
    original_sql: failing_sql,
    healed_sql: failing_sql,
    diagnosis: `Runtime error encountered: ${error_message}`,
    sqlstate_code: "42000",
    can_execute: false,
  }
}
