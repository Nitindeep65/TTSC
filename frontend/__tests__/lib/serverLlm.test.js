import {
  detectVisualIntent,
  generateClarificationChips,
  validateAndEnforceSafety,
  sanitizeAndParseJson,
  getDashboardStarterTemplates,
  getFallbackDashboardPlan,
  generateServerlessMockDataForWidget,
} from "@/lib/serverLlm"

describe("serverLlm utilities", () => {
  describe("detectVisualIntent", () => {
    it("detects line chart intent for trend queries", () => {
      const intent = detectVisualIntent("Show revenue trend over time")
      expect(intent.should_visualize).toBe(true)
      expect(intent.recommended_chart).toBe("line")
    })

    it("detects pie chart intent for proportion queries", () => {
      const intent = detectVisualIntent("Show market share breakdown by category")
      expect(intent.should_visualize).toBe(true)
      expect(intent.recommended_chart).toBe("pie")
    })

    it("detects bar chart intent for comparison queries", () => {
      const intent = detectVisualIntent("Compare sales by category")
      expect(intent.should_visualize).toBe(true)
      expect(intent.recommended_chart).toBe("bar")
    })

    it("defaults to table when no visual keywords are present", () => {
      const intent = detectVisualIntent("List all registered users")
      expect(intent.should_visualize).toBe(false)
      expect(intent.recommended_chart).toBe("table")
    })
  })

  describe("generateClarificationChips", () => {
    it("generates date chips for date-related questions", () => {
      const chips = generateClarificationChips("What date range or timeframe would you like?")
      expect(chips).toContain("Last 30 Days")
    })

    it("generates status chips for status questions", () => {
      const chips = generateClarificationChips("Which order status do you want to filter by?")
      expect(chips).toContain("Completed Orders Only")
    })
  })

  describe("validateAndEnforceSafety", () => {
    it("appends LIMIT 50 to open SELECT queries", () => {
      const safe = validateAndEnforceSafety("SELECT * FROM users")
      expect(safe).toContain("LIMIT 50")
    })

    it("throws error for destructive operations like DROP", () => {
      expect(() => {
        validateAndEnforceSafety("DROP TABLE users;")
      }).toThrow(/Dangerous operation detected/)
    })

    it("throws error for INSERT statements", () => {
      expect(() => {
        validateAndEnforceSafety("INSERT INTO users (name) VALUES ('hacker');")
      }).toThrow(/Dangerous operation detected/)
    })
  })

  describe("sanitizeAndParseJson", () => {
    it("parses valid JSON directly", () => {
      const obj = sanitizeAndParseJson('{"status": "complete"}')
      expect(obj.status).toBe("complete")
    })

    it("strips markdown code blocks", () => {
      const obj = sanitizeAndParseJson('```json\n{"status": "needs_clarification"}\n```')
      expect(obj.status).toBe("needs_clarification")
    })
  })

  describe("buildSystemPrompt & schema grounding", () => {
    it("includes strict zero-hallucination and error recovery rules in system prompt", () => {
      const customSchema = `CREATE TABLE users (\n    id INT PRIMARY KEY,\n    email VARCHAR(255) NOT NULL,\n    created_at TIMESTAMPTZ\n);`
      const { buildSystemPrompt } = require("@/lib/serverLlm")
      const prompt = buildSystemPrompt(customSchema)
      expect(prompt).toContain("ZERO HALLUCINATION")
      expect(prompt).toContain("ERROR NOTICE RECOVERY")
      expect(prompt).toContain("CREATE TABLE users")
    })
  })

  describe("executeLlmDiagnosis recovery", () => {
    it("repairs column mismatch using universal fallback when API is mocked/unavailable", async () => {
      const { executeLlmDiagnosis } = require("@/lib/serverLlm")
      const res = await executeLlmDiagnosis({
        error_message: 'column "name" does not exist',
        failing_sql: "SELECT id, name, email, role FROM users LIMIT 50;",
        live_schema: `CREATE TABLE users (id INT, email VARCHAR(255), created_at TIMESTAMPTZ);`,
        user_prompt: "bring all the users",
      })
      expect(res.can_execute).toBe(true)
      expect(res.healed_sql).toContain("SELECT * FROM users")
    })
  })

  describe("compileFallbackQuery & multi-turn follow-ups", () => {
    const { compileFallbackQuery, extractTableNameFromPrompt } = require("@/lib/serverLlm")
    const schema = `
CREATE TABLE users (id INT, email VARCHAR(255), created_at TIMESTAMPTZ);
CREATE TABLE contracts (id INT, title VARCHAR(100), created_at TIMESTAMPTZ);
CREATE TABLE counterparties (id INT, name VARCHAR(100), created_at TIMESTAMPTZ);
`

    it("extracts table names from phrasal prompts", () => {
      expect(extractTableNameFromPrompt("give me the list of the contracts")).toBe("contracts")
      expect(extractTableNameFromPrompt("give the list of the counterparties")).toBe("counterparties")
      expect(extractTableNameFromPrompt("bring all the users")).toBe("users")
    })

    it("compiles direct query for contracts", () => {
      const res = compileFallbackQuery({
        user_prompt: "give me the list of the contracts",
        session_history: [],
        live_schema: schema,
      })
      expect(res.status).toBe("complete")
      expect(res.extracted_data.sql_query).toBe("SELECT * FROM contracts LIMIT 50;")
    })

    it("maintains table context on follow-up chips like All Time or Last 30 Days", () => {
      const history = [{ role: "user", content: "give the list of the counterparties" }]

      const resAllTime = compileFallbackQuery({
        user_prompt: "All Time",
        session_history: history,
        live_schema: schema,
      })
      expect(resAllTime.status).toBe("complete")
      expect(resAllTime.extracted_data.sql_query).toBe("SELECT * FROM counterparties LIMIT 50;")

      const res30Days = compileFallbackQuery({
        user_prompt: "Last 30 Days",
        session_history: history,
        live_schema: schema,
      })
      expect(res30Days.status).toBe("complete")
      expect(res30Days.extracted_data.sql_query).toContain("FROM counterparties WHERE created_at >= NOW() - INTERVAL '30 days'")
    })

    it("corrects spelling mistakes and typos against schema tables (e.g. counterpatis -> counterparties)", () => {
      const res1 = compileFallbackQuery({
        user_prompt: "give me the list of the counterpatis",
        session_history: [],
        live_schema: schema,
      })
      expect(res1.status).toBe("complete")
      expect(res1.extracted_data.sql_query).toBe("SELECT * FROM counterparties LIMIT 50;")

      const res2 = compileFallbackQuery({
        user_prompt: "show contarcts",
        session_history: [],
        live_schema: schema,
      })
      expect(res2.status).toBe("complete")
      expect(res2.extracted_data.sql_query).toBe("SELECT * FROM contracts LIMIT 50;")

      const res3 = compileFallbackQuery({
        user_prompt: "bring all usrs",
        session_history: [],
        live_schema: schema,
      })
      expect(res3.status).toBe("complete")
      expect(res3.extracted_data.sql_query).toBe("SELECT * FROM users LIMIT 50;")

      const res4 = compileFallbackQuery({
        user_prompt: "give the list of the ocunter parties",
        session_history: [],
        live_schema: schema,
      })
      expect(res4.status).toBe("complete")
      expect(res4.extracted_data.sql_query).toBe("SELECT * FROM counterparties LIMIT 50;")

      const res5 = compileFallbackQuery({
        user_prompt: "give the list of the counter parties",
        session_history: [],
        live_schema: schema,
      })
      expect(res5.status).toBe("complete")
      expect(res5.extracted_data.sql_query).toBe("SELECT * FROM counterparties LIMIT 50;")
    })
  })

  describe("Dashboard Architect utilities", () => {
    it("returns 4 starter templates", () => {
      const templates = getDashboardStarterTemplates()
      expect(templates.length).toBe(4)
      expect(templates[0].id).toBe("saas_executive")
    })

    it("generates fallback dashboard plan with 4 widgets for SaaS", () => {
      const plan = getFallbackDashboardPlan("Build me an Executive SaaS Dashboard")
      expect(plan.theme).toBe("executive")
      expect(plan.widgets.length).toBe(4)
      expect(plan.widgets[0].recommended_chart).toBe("line")
    })

    it("generates fallback dashboard plan for general e-commerce", () => {
      const plan = getFallbackDashboardPlan("Orders and products dashboard")
      expect(plan.theme).toBe("ecommerce")
      expect(plan.widgets.length).toBe(4)
    })

    it("generates mock rows and columns for widgets", () => {
      const data = generateServerlessMockDataForWidget({ id: "net_mrr", recommended_chart: "line" })
      expect(data.columns).toContain("month")
      expect(data.columns).toContain("gross_revenue")
      expect(data.rows.length).toBeGreaterThan(0)
      expect(data.kpi_value).toBeDefined()
    })
  })
})
