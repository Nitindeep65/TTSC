'use client'

import { useState } from "react"
import { ArrowUp, Check, ChevronDown, Database, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

function Dashboard() {
  const [query, setQuery] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const generatedSql = `SELECT customer_name, COUNT(*) AS order_count
FROM orders
WHERE ordered_at >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY customer_name
ORDER BY order_count DESC;`

  const examples = [
    "Which customers placed the most orders this month?",
    "Show monthly revenue for the last six months",
    "Find products with low inventory",
  ]

  const handleGenerate = () => {
    if (!query.trim()) return

    setIsGenerating(true)
    setHasResult(false)
    window.setTimeout(() => {
      setIsGenerating(false)
      setHasResult(true)
    }, 700)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedSql)
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 1600)
  }

  return (
    <main className="flex-1 bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Natural language analytics
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            What do you want to learn from your data?
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Ask a question in plain English and get an explainable SQL query back.
          </p>
        </section>

        <section className="rounded-xl border bg-background p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="size-4 text-muted-foreground" />
              <span>Sales warehouse</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
              Demo connection
            </span>
          </div>

          <div className="relative">
            <label htmlFor="data-question" className="sr-only">
              Ask a question about your data
            </label>
            <textarea
              id="data-question"
              value={query}
              onChange={(event) => setQuery(event.target.value.slice(0, 500))}
              onKeyDown={(event) => {
                if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                  handleGenerate()
                }
              }}
              placeholder="Ask a question about your data..."
              rows={4}
              className="w-full resize-none rounded-lg border bg-background px-4 py-3 pr-14 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <Button
              type="button"
              size="icon"
              aria-label="Generate SQL"
              disabled={!query.trim() || isGenerating}
              onClick={handleGenerate}
              className="absolute bottom-3 right-3 rounded-lg"
            >
              <ArrowUp className="size-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>Press Cmd/Ctrl + Enter to generate</span>
            <span>{query.length}/500</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuery(example)}
                className="rounded-full border px-3 py-1.5 text-left text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                {example}
              </button>
            ))}
          </div>
        </section>

        <section aria-live="polite" className="rounded-xl border bg-background shadow-sm">
          {!hasResult && !isGenerating ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Database className="size-5" />
              </div>
              <h2 className="font-medium">Your generated query will appear here</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Start with one of the examples above or describe the business question you want to answer.
              </p>
            </div>
          ) : isGenerating ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Translating your question into SQL...
            </div>
          ) : (
            <div className="divide-y">
              <div className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-medium">Generated SQL</p>
                  <p className="mt-1 text-xs text-muted-foreground">Based on the Sales warehouse schema</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                  <Check className="size-4" />
                  {isCopied ? "Copied" : "Copy SQL"}
                </Button>
              </div>
              <pre className="overflow-x-auto bg-zinc-950 p-5 text-sm leading-6 text-zinc-100">
                <code>{generatedSql}</code>
              </pre>
              <div className="p-5">
                <p className="mb-3 text-sm font-medium">Preview results</p>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-96 text-left text-sm">
                    <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Orders</th>
                        <th className="px-4 py-3 font-medium">Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3">Acme Corporation</td>
                        <td className="px-4 py-3">248</td>
                        <td className="px-4 py-3 text-emerald-600">+18.4%</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3">Northstar Labs</td>
                        <td className="px-4 py-3">193</td>
                        <td className="px-4 py-3 text-emerald-600">+11.2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default Dashboard