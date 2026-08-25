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

Your objective is to analyze user requests, evaluate conversational context, clarify ambiguities, and generate safe, optimized, production-ready queries (PostgreSQL SQL by default, or MongoDB MQL / Redis commands if requested) based strictly on the live schema provided.

---

### INPUT CONTEXT PROVIDED
- LIVE DATABASE SCHEMA & COLLECTIONS:
${schema}

---

### CORE EVALUATION RULES

1. SCHEMA & COLLECTION GROUNDING (ZERO HALLUCINATION):
   - Only reference tables, columns, or collections/fields explicitly present in the provided schema.
   - Respect data types (e.g., UUID, TIMESTAMPTZ, JSONB, BSON object types).

2. CLARIFICATION CRITERIA (WHEN TO PAUSE QUERY GENERATION):
   - Set "status" to "needs_clarification" if any of the following are missing or ambiguous:
     * Time windows or date ranges on cumulative/historical tables or collections (e.g., "sales" without a time range).
     * Status filters on transactional entities (e.g., completed vs. pending vs. cancelled orders).
     * Ambiguous ranking/aggregation definitions (e.g., "top users" -> by total spend, by order count, or by activity?).
     * Vague threshold requirements.
   - In "message", ask a concise, targeted question addressing the missing parameters. Set "extracted_data" to null.

3. COMPLETION CRITERIA (WHEN TO GENERATE QUERY):
   - Set "status" to "complete" when all required filters, joins, aggregations, and metrics are clear across the conversation history.
   - In "message", provide a brief, professional confirmation (e.g. "Here is your PostgreSQL query for ...").

4. SAFETY & RESOURCE CONSTRAINTS:
   - READ-ONLY ENFORCEMENT: Output ONLY SELECT statements for SQL, or read-only find() / aggregate() for MongoDB. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE.
   - RESOURCE PROTECTION: Apply an explicit LIMIT (default to 50 if unspecified) on open-ended queries.

---

### STRICT JSON OUTPUT FORMAT
Respond ONLY with a valid, raw JSON object matching this schema (no markdown formatting, no backticks, no code fences):

{
  "status": "needs_clarification" | "complete",
  "message": "Direct acknowledgment and specific clarification question, OR friendly confirmation message",
  "extracted_data": {
    "sql_query": "SELECT ... FROM ... WHERE ...;",
    "tables_identified": ["table_or_collection_1", "table_or_collection_2"],
    "explanation": "1-2 sentence plain-English explanation of joins/pipeline stages, filters, aggregations, and limits applied."
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
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`LLM provider returned status ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content || "{}"
    const parsed = sanitizeAndParseJson(rawContent)

    const status = parsed.status === "complete" ? "complete" : "needs_clarification"
    const message = parsed.message || (status === "needs_clarification" ? "Could you please clarify your request?" : "Query generated successfully.")
    const extractedDataRaw = parsed.extracted_data

    if (status === "complete" && extractedDataRaw?.sql_query) {
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
    console.error("LLM Clarification Error:", err)
    
    // Graceful intelligent fallback if LLM endpoint has temporary network timeout
    return {
      status: "needs_clarification",
      message: `Could you please clarify the target metric, timeframe (e.g. last 30 days or YTD), or specific filters for "${user_prompt}"?`,
      options: ["Last 30 Days", "Completed Orders Only", "Top 5 by Total Spend", "Calendar Year 2024"],
      extracted_data: null,
      visual_intent: visualIntent,
    }
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

  const schema = liveSchema && liveSchema.trim() ? liveSchema : LIVE_DATABASE_SCHEMA_SQL

  const prompt = `You are an expert SQL Doctor and Critic Healer.
A query failed with the following runtime error:
ERROR: ${error_message}
FAILING QUERY:
${failing_sql}
USER INTENT: ${user_prompt || "N/A"}

DATABASE SCHEMA:
${schema}

Diagnose the exact root cause of the error (e.g., wrong column name, missing join, invalid GROUP BY, syntax error) and provide a healed, valid PostgreSQL read-only query that adheres to the schema.

Respond ONLY with valid JSON:
{
  "diagnosis": "Clear explanation of the error cause and how it was fixed",
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
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    })

    if (res.ok) {
      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || "{}"
      const parsed = sanitizeAndParseJson(raw)
      const healed = validateAndEnforceSafety(parsed.healed_sql || failing_sql)
      return {
        original_sql: failing_sql,
        healed_sql: healed,
        diagnosis: parsed.diagnosis || "Query healed successfully against schema.",
        sqlstate_code: parsed.sqlstate_code || "42000",
        can_execute: true,
      }
    }
  } catch (err) {
    console.error("SQL Doctor LLM Error:", err)
  }

  return {
    original_sql: failing_sql,
    healed_sql: failing_sql,
    diagnosis: `Runtime error encountered: ${error_message}`,
    sqlstate_code: "42000",
    can_execute: false,
  }
}
