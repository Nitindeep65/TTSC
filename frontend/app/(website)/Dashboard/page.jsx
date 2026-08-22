'use client'

import { useState } from "react"
import {
  ArrowUp,
  Check,
  Code2,
  Copy,
  Database,
  HelpCircle,
  MessageSquareText,
  Sparkles,
  TableProperties,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import axios from "axios"

const sqlExamples = [
  "Show top 5 customers by total order spend in 2024",
  "List products with stock quantity less than 15 ordered by price",
  "Find all orders with 'completed' status and amount greater than 200",
  "Calculate total revenue generated per product category",
  "Find users who registered in the last 30 days but haven't placed an order",
]

function Dashboard() {
  const [query, setQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [activeTab, setActiveTab] = useState("formatted")

  const handleGenerate = async (customPrompt) => {
    const promptToSend = typeof customPrompt === "string" ? customPrompt : query
    if (!promptToSend.trim() || isGenerating) return

    if (typeof customPrompt === "string") {
      setQuery(customPrompt)
    }

    setIsGenerating(true)
    setHasResult(false)
    setErrorMessage("")

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/clarification/", {
        user_prompt: promptToSend.trim(),
        session_history: [],
      })

      setApiResponse(response.data)
      setHasResult(true)
    } catch (error) {
      setErrorMessage(
        error.response?.data?.detail || "Could not reach FastAPI server at http://127.0.0.1:8000. Ensure the backend server is running."
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

  const extractedData = apiResponse?.extracted_data

  return (
    <main className="flex-1 bg-[#f7f8f5]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        
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
              Test single-turn prompts against the PostgreSQL database schema.
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              placeholder="Ask a question about users, orders, order_items, or products (e.g. 'Show total sales by category in June')..."
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
              <p className="font-medium">Evaluating user intent with Llama-3.1-8B...</p>
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
                    <div className="rounded-xl border border-[#ecd9be] bg-[#fdf8f0] p-4 text-[#754817]">
                      <div className="flex items-center gap-2 font-semibold text-sm">
                        <HelpCircle className="size-4 text-[#d98b2c]" />
                        Clarification Required
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-[#5c3e1b]">
                        {apiResponse.message}
                      </p>
                      <div className="mt-3">
                        <Link
                          href="/Dashboard/chat"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#273e30] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#345341]"
                        >
                          <MessageSquareText className="size-3.5 text-[#71c897]" />
                          Answer in Multi-Turn Chat
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
                            Tables Identified
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-2">
                            {extractedData.tables_identified.map((tbl) => (
                              <span
                                key={tbl}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#cfddd0] bg-[#eef6f0] px-2.5 py-1 font-mono text-xs font-medium text-[#226340]"
                              >
                                <Database className="size-3 text-[#4ca873]" />
                                {tbl}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#718278]">
                            Compiled PostgreSQL Statement
                          </p>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-[#2b3c31] bg-[#17231c] p-4 shadow-inner">
                          <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-[#d7f1df]">
                            <code>{extractedData.sql_query}</code>
                          </pre>
                        </div>
                      </div>
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

export default Dashboard