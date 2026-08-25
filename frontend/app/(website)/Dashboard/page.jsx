'use client'

import { useState } from "react"
import {
  ArrowUp,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Copy,
  Database,
  HelpCircle,
  Loader2,
  MessageSquareText,
  Play,
  Sparkles,
  Table2,
  TableProperties,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { clarificationApi } from "@/lib/api"
import { useDatabase } from "@/lib/databaseContext"
import { useAuth } from "@/lib/authContext"

const sqlExamples = [
  "Show top 5 customers by total order spend in 2024",
  "List available products with stock quantity less than 15 ordered by price",
  "Find all orders with 'completed' status and amount greater than 200 in last 30 days",
  "Calculate total revenue generated per product category in 2024",
  "Find users who registered in the last 30 days but haven't placed an order",
]

function generateClarificationChips(text) {
  const t = (text || "").toLowerCase()
  const chips = []
  if (t.includes("time") || t.includes("date") || t.includes("window") || t.includes("year") || t.includes("month") || t.includes("range")) {
    chips.push("Last 30 Days", "Calendar Year 2024", "All Time")
  }
  if (t.includes("status") || t.includes("completed") || t.includes("active") || t.includes("pending")) {
    chips.push("Completed Orders Only", "Active Users Only", "Include All Statuses")
  }
  if (t.includes("ranking") || t.includes("spend") || t.includes("metric") || t.includes("count") || t.includes("top")) {
    chips.push("Top 5 by Spend", "Top 10 by Order Count", "Order by Recent Date")
  }
  if (chips.length === 0) {
    chips.push("Yes, proceed with defaults", "Filter by last 30 days", "Top 5 results")
  }
  return Array.from(new Set(chips)).slice(0, 4)
}

export default function Dashboard() {
  const { dbInfo, connectionUri, setIsModalOpen, executeLiveQuery } = useDatabase()
  const { user } = useAuth()

  const [query, setQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeTab, setActiveTab] = useState("formatted")

  // Live execution state
  const [isExecutingLive, setIsExecutingLive] = useState(false)
  const [liveResult, setLiveResult] = useState(null)

  const handleGenerate = async (customPrompt) => {
    const promptToSend = typeof customPrompt === "string" ? customPrompt : query
    if (!promptToSend.trim() || isGenerating) return

    if (typeof customPrompt === "string") {
      setQuery(customPrompt)
    }

    setIsGenerating(true)
    setHasResult(false)
    setErrorMessage("")
    setLiveResult(null)

    try {
      const payload = {
        user_prompt: promptToSend.trim(),
        session_history: [],
        user_id: user?.uid || "guest",
        user_email: user?.email || "demo@querycraft.dev",
      }

      if (dbInfo?.schema_sql) {
        payload.live_schema = dbInfo.schema_sql
      }
      if (connectionUri) {
        payload.connection_uri = connectionUri
      }

      const data = await clarificationApi.compileQuery(payload)

      setApiResponse(data)
      setHasResult(true)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || error.message || "Could not reach backend API. Ensure the backend server is running."
      )
      setHasResult(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async (textToCopy) => {
    if (!textToCopy) return
    await navigator.clipboard.writeText(textToCopy)
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 1800)
  }

  const handleRunOnDatabase = async (sql) => {
    if (!connectionUri) {
      setIsModalOpen(true)
      return
    }

    setIsExecutingLive(true)
    try {
      const result = await executeLiveQuery(sql)
      setLiveResult({
        success: true,
        columns: result.columns,
        rows: result.rows,
        rowCount: result.row_count,
      })
    } catch (err) {
      setLiveResult({
        success: false,
        error: err.response?.data?.detail || err.message,
      })
    } finally {
      setIsExecutingLive(false)
    }
  }

  const extractedData = apiResponse?.extracted_data

  return (
    <main className="flex-1 bg-[#f7f8f5]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        
        {/* Banner if connected to cloud DB */}
        {dbInfo && (
          <div className="flex items-center justify-between rounded-xl border border-[#cbe3d2] bg-[#f0faf3] px-4 py-2.5 text-xs text-[#1e6138]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#3ba565]" />
              <span>
                <strong>Cloud DB Connected:</strong> {dbInfo.host} ({dbInfo.database}) — {dbInfo.tables_count} live tables introspected.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-semibold text-[#1a5732] underline hover:text-[#124024]"
            >
              Manage DB
            </button>
          </div>
        )}

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d2e2d5] bg-[#edf7f0] px-3 py-1 text-xs font-semibold text-[#256a44]">
              <Sparkles className="size-3.5" />
              SQL Clarification &amp; Generation Workspace
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#1f2d24] sm:text-3xl">
              Natural Language Query Compiler
            </h1>
            <p className="mt-1 text-sm text-[#66776d]">
              {dbInfo ? `Grounded in your live PostgreSQL schema on ${dbInfo.host}.` : "Test single-turn prompts against the Cloud PostgreSQL schema."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!dbInfo && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#bde2cb] bg-[#eef8f2] px-3 py-2 text-xs font-semibold text-[#1a5b33] shadow-2xs transition hover:bg-[#e1f3e7]"
              >
                <Cloud className="size-3.5 text-[#30975a]" />
                <span>Connect Cloud DB</span>
              </button>
            )}

            <Link
              href="/Dashboard/chat"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1f2d24] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#2f4837]"
            >
              <MessageSquareText className="size-3.5 text-[#71c897]" />
              Open Multi-Turn Chat
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#dfe7df] bg-white p-5 shadow-sm sm:p-6">
          <div className="relative">
            <label htmlFor="data-question" className="sr-only">
              Ask a question
            </label>
            <textarea
              id="data-question"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, 600))}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  handleGenerate()
                }
              }}
              placeholder="Ask a question about your database (e.g. 'Show total sales by product category in 2024')..."
              rows={4}
              className="w-full resize-none rounded-xl border border-[#dfe7df] bg-[#fbfdfb] px-4 py-3.5 pr-14 text-sm leading-relaxed text-[#1f2d24] outline-none transition placeholder:text-[#9aa59d] focus:border-[#4ca873] focus:ring-4 focus:ring-[#4ca873]/10"
            />
            <Button
              type="button"
              size="icon"
              aria-label="Send Query"
              disabled={!query.trim() || isGenerating}
              onClick={() => handleGenerate()}
              className="absolute bottom-3 right-3 rounded-lg bg-[#1f2d24] text-white transition hover:bg-[#324e3c]"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#718278]">
            <span className="flex items-center gap-1.5">
              <span className="rounded border border-[#dfe7df] bg-[#f2f5f2] px-1.5 py-0.5 font-mono text-[10px]">
                Cmd/Ctrl + Enter
              </span>
              <span>to compile</span>
            </span>
            <span>{query.length}/600</span>
          </div>

          <div className="mt-5 border-t border-[#eef2ee] pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#819287]">
              Sample SQL Prompts
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {sqlExamples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => handleGenerate(example)}
                  className="rounded-lg border border-[#e0e8e1] bg-[#fbfdfb] px-3 py-1.5 text-left text-xs font-medium text-[#44554a] transition hover:border-[#79b790] hover:bg-[#f1f8f2] hover:text-[#236742]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section aria-live="polite" className="overflow-hidden rounded-2xl border border-[#dfe7df] bg-white shadow-sm">
          {!hasResult && !isGenerating ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-14 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#e9f4ed] text-[#28734d]">
                <Database className="size-6" />
              </div>
              <h2 className="text-base font-semibold text-[#1f2d24]">FastAPI response will display here</h2>
              <p className="mt-1.5 max-w-md text-sm text-[#728078]">
                Type a natural language question above or choose a sample prompt to compile into PostgreSQL.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-14 text-sm text-[#5c6e63]">
              <span className="size-6 animate-spin rounded-full border-2 border-[#4ca873] border-t-transparent" />
              <p className="font-medium">Evaluating user intent against Cloud PostgreSQL schema...</p>
            </div>
          ) : errorMessage ? (
            <div className="p-6">
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-red-800">
                <p className="text-sm font-semibold">Error Connecting to Backend</p>
                <p className="mt-1 text-xs">{errorMessage}</p>
                <div className="mt-3 text-xs text-red-700">
                  Tip: Make sure the FastAPI server is running with <code className="rounded bg-red-100 px-1 py-0.5 font-mono">fastapi dev app/main.py</code> or <code className="rounded bg-red-100 px-1 py-0.5 font-mono">uvicorn app.main:app --reload</code>.
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8ece7] bg-[#fbfdfb] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      apiResponse?.status === "complete"
                        ? "bg-[#edf7ef] text-[#246944]"
                        : "bg-[#fcf3e6] text-[#935b1d]"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        apiResponse?.status === "complete" ? "bg-[#4ca873]" : "bg-[#d98b2c]"
                      }`}
                    />
                    Status: {apiResponse?.status}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-lg border border-[#dfe7df] bg-white p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveTab("formatted")}
                      className={`rounded-md px-2.5 py-1 font-medium transition ${
                        activeTab === "formatted"
                          ? "bg-[#1f2d24] text-white"
                          : "text-[#55675c] hover:bg-[#f1f6f2]"
                      }`}
                    >
                      Formatted View
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("raw")}
                      className={`rounded-md px-2.5 py-1 font-medium transition ${
                        activeTab === "raw"
                          ? "bg-[#1f2d24] text-white"
                          : "text-[#55675c] hover:bg-[#f1f6f2]"
                      }`}
                    >
                      Raw JSON
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        extractedData?.sql_query || JSON.stringify(apiResponse, null, 2)
                      )
                    }
                    className="gap-1.5 text-xs"
                  >
                    {isCopied ? <Check className="size-3.5 text-[#4ca873]" /> : <Copy className="size-3.5" />}
                    {isCopied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>

              {activeTab === "raw" ? (
                <pre className="overflow-x-auto bg-[#17231c] p-5 font-mono text-xs leading-relaxed text-[#d7f1df]">
                  <code>{JSON.stringify(apiResponse, null, 2)}</code>
                </pre>
              ) : (
                <div className="space-y-5 p-6">
                  {apiResponse?.status === "needs_clarification" && (
                    <div className="rounded-xl border border-amber-200 bg-[#fdf8f0] p-5 text-[#754817] space-y-3.5">
                      <div className="flex items-center gap-2 font-semibold text-sm text-amber-800">
                        <HelpCircle className="size-4 text-[#d98b2c]" />
                        Clarification Required Before Compilation
                      </div>
                      <p className="text-sm leading-relaxed text-[#5c3e1b]">
                        {apiResponse.message}
                      </p>

                      <div className="pt-2 border-t border-amber-200/70 space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                          <Sparkles className="size-3 text-[#d98b2c]" />
                          <span>1-Tap Quick Responses:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {generateClarificationChips(apiResponse.message).map((chip, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleGenerate(`${query} — ${chip}`)}
                              className="clarify-chip hover-lift"
                            >
                              <span>{chip}</span>
                              <span className="text-[#34c06a] text-xs font-bold">→</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <Link
                          href="/Dashboard/chat"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f2d24] px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2d4634]"
                        >
                          <MessageSquareText className="size-3.5 text-[#71c897]" />
                          Open in Multi-Turn Chat Studio
                        </Link>
                      </div>
                    </div>
                  )}

                  {apiResponse?.status === "complete" && extractedData && (
                    <>
                      {apiResponse.message && (
                        <div className="text-sm font-medium text-[#2d3e33]">
                          {apiResponse.message}
                        </div>
                      )}

                      {extractedData.explanation && (
                        <div className="rounded-xl border border-[#e2ece3] bg-[#f8fbf8] p-4">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#718278]">
                            Query Explanation
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-[#35483c]">
                            {extractedData.explanation}
                          </p>
                        </div>
                      )}

                      {extractedData.tables_identified?.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#718278]">
                            Tables Referenced
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {extractedData.tables_identified.map((table) => (
                              <span
                                key={table}
                                className="rounded-md border border-[#cbe0d0] bg-[#eef7f1] px-2.5 py-1 font-mono text-xs font-medium text-[#205d3c]"
                              >
                                {table}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {extractedData.sql_query && (
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#718278]">
                              Generated PostgreSQL Query
                            </span>

                            <button
                              type="button"
                              onClick={() => handleRunOnDatabase(extractedData.sql_query)}
                              disabled={isExecutingLive}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#216b44] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#2c8757] disabled:opacity-50"
                            >
                              {isExecutingLive ? (
                                <>
                                  <Loader2 className="size-3.5 animate-spin" />
                                  <span>Executing on DB...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="size-3.5" />
                                  <span>{connectionUri ? "Run on Cloud DB" : "Connect DB & Run"}</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="overflow-hidden rounded-xl border border-[#27382d] bg-[#17231c]">
                            <div className="flex items-center justify-between border-b border-white/10 bg-[#121c16] px-4 py-2 text-xs text-[#86a894]">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Code2 className="size-3.5 text-[#4ca873]" />
                                PostgreSQL (Read-Only)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopy(extractedData.sql_query)}
                                className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-[#d7f1df] transition hover:bg-white/10"
                              >
                                {isCopied ? <Check className="size-3 text-[#4ca873]" /> : <Copy className="size-3" />}
                                {isCopied ? "Copied" : "Copy"}
                              </button>
                            </div>
                            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#d7f1df]">
                              <code>{extractedData.sql_query}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Live query results table if executed */}
                      {liveResult && (
                        <div className="rounded-xl border border-[#d2e2d6] bg-white p-4 shadow-xs">
                          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#eaf0eb]">
                            <div className="flex items-center gap-2">
                              <Table2 className="size-4 text-[#206642]" />
                              <span className="text-xs font-bold text-[#1f2d24]">
                                Live Cloud Query Execution Result
                              </span>
                            </div>
                            <span className="text-xs text-[#55695e]">
                              {liveResult.rowCount} row(s) returned
                            </span>
                          </div>

                          {liveResult.success ? (
                            liveResult.rows?.length > 0 ? (
                              <div className="max-h-72 overflow-auto rounded-lg border border-[#e1e9e2]">
                                <table className="w-full text-left font-mono text-xs">
                                  <thead className="sticky top-0 bg-[#f4f7f5] text-[#2d4838]">
                                    <tr>
                                      {liveResult.columns.map((col) => (
                                        <th key={col} className="p-2.5 font-bold border-b border-[#e1e9e2]">
                                          {col}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-[#edf2ee]">
                                    {liveResult.rows.map((row, rIdx) => (
                                      <tr key={rIdx} className="hover:bg-[#f9fbf9]">
                                        {liveResult.columns.map((col) => (
                                          <td key={col} className="p-2.5 text-[#35483d] whitespace-nowrap">
                                            {row[col] === null ? (
                                              <span className="italic text-gray-400">null</span>
                                            ) : (
                                              String(row[col])
                                            )}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-xs text-[#6e8075] italic">Query executed successfully, 0 rows returned.</p>
                            )
                          ) : (
                            <div className="text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                              <strong>Execution Error:</strong> {liveResult.error}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}