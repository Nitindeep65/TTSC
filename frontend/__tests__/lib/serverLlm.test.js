import {
  detectVisualIntent,
  generateClarificationChips,
  validateAndEnforceSafety,
  sanitizeAndParseJson,
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
})
