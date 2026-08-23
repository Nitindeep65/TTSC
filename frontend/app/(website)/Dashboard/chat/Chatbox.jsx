'use client'

import { useState, useRef, useEffect } from "react"
import {
  ArrowUp,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Cloud,
  Code2,
  Columns,
  Copy,
  Database,
  ExternalLink,
  HelpCircle,
  Key,
  Layers,
  Lightbulb,
  Loader2,
  Maximize2,
  MessageSquare,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Table2,
  Terminal,
  Trash2,
  User,
} from "lucide-react"
import axios from "axios"
import { useDatabase } from "@/lib/databaseContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const starterPrompts = [
  {
    type: "Ambiguous (Clarification)",
    text: "Show top customers",
    desc: "Triggers clarification for metric, date range, and order status",
  },
  {
    type: "Complete Query",
    text: "Find completed orders from the last 7 days with customer names and total amount",
    desc: "Immediately produces safe, joined PostgreSQL SELECT query",
  },
  {
    type: "Ambiguous (Clarification)",
    text: "Show recent payments with high values",
    desc: "Asks for time window and threshold definition",
  },
  {
    type: "Complete Query",
    text: "List available products with stock quantity below 20 ordered by price ASC",
    desc: "Generates filtered list with safety LIMIT applied",
  },
]

const fallbackSchemaList = [
  {
    table_name: "users",
    description: "Registered user accounts and credentials",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "email", type: "VARCHAR(255)" },
      { name: "name", type: "VARCHAR(100)" },
      { name: "role", type: "VARCHAR(50)" },
      { name: "is_active", type: "BOOLEAN" },
      { name: "metadata", type: "JSONB" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    table_name: "products",
    description: "Catalog items available for purchase",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "category", type: "VARCHAR(100)" },
      { name: "price", type: "NUMERIC(10,2)" },
      { name: "stock_quantity", type: "INTEGER" },
      { name: "attributes", type: "JSONB" },
      { name: "is_available", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    table_name: "orders",
    description: "Customer transactions and purchase orders",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "user_id", type: "UUID", is_foreign_key: true, references: "users(id)" },
      { name: "total_amount", type: "NUMERIC(12,2)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "shipping_address", type: "JSONB" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    table_name: "order_items",
    description: "Line items contained within each order",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "order_id", type: "UUID", is_foreign_key: true, references: "orders(id)" },
      { name: "product_id", type: "UUID", is_foreign_key: true, references: "products(id)" },
      { name: "quantity", type: "INTEGER" },
      { name: "unit_price", type: "NUMERIC(10,2)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    table_name: "payments",
    description: "Payment transactions, methods, and status",
    columns: [
      { name: "id", type: "UUID", is_primary_key: true },
      { name: "order_id", type: "UUID", is_foreign_key: true, references: "orders(id)" },
      { name: "amount", type: "NUMERIC(12,2)" },
      { name: "payment_method", type: "VARCHAR(50)" },
      { name: "status", type: "VARCHAR(50)" },
      { name: "transaction_ref", type: "VARCHAR(100)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
]

export default function Chatbox() {
  const {
    connectionUri,
    dbInfo,
    setIsModalOpen,
    executeLiveQuery,
  } = useDatabase()

  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [executingIndex, setExecutingIndex] = useState(null)
  const [queryResults, setQueryResults] = useState({})
  const [schemaTables, setSchemaTables] = useState(fallbackSchemaList)
  const [dbType, setDbType] = useState("Cloud PostgreSQL")
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  // Live Schema Helper Collapse State (collapsible sidebar panel)
  const [isHelperOpen, setIsHelperOpen] = useState(true)
  const [collapsedTables, setCollapsedTables] = useState({
    users: false,
    products: false,
    orders: false,
    order_items: true,
    payments: true,
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, queryResults])

  // Sync active schema with connected cloud database or fallback
  useEffect(() => {
    if (dbInfo && dbInfo.tables?.length) {
      setSchemaTables(dbInfo.tables)
      setDbType(`Connected: ${dbInfo.host}`)
    } else {
      const fetchDefaultSchema = async () => {
        try {
          const res = await axios.get("http://127.0.0.1:8000/api/clarification/schema")
          if (res.data?.tables?.length) {
            setSchemaTables(res.data.tables)
          }
          if (res.data?.database_type) {
            setDbType(res.data.database_type)
          }
        } catch (err) {
          // keep fallback
        }
      }
      fetchDefaultSchema()
    }
  }, [dbInfo])

  // Auto-resize textarea height like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`
    }
  }, [inputText])

  const toggleTableCollapse = (tableName) => {
    setCollapsedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  const toggleCollapseAll = () => {
    const allCollapsed = schemaTables.every((t) => collapsedTables[t.table_name || t.table])
    const nextState = {}
    schemaTables.forEach((t) => {
      nextState[t.table_name || t.table] = !allCollapsed
    })
    setCollapsedTables(nextState)
  }

  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === "string" ? textToSend : inputText
    if (!query.trim() || isLoading) return

    const userText = query.trim()
    const newUserMsg = {
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    const historyPayload = messages.map((m) => ({
      role: m.role,
      content: m.rawContent || m.content,
    }))

    setMessages((prev) => [...prev, newUserMsg])
    setInputText("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setIsLoading(true)

    try {
      const payload = {
        user_prompt: userText,
        session_history: historyPayload,
      }

      if (dbInfo?.schema_sql) {
        payload.live_schema = dbInfo.schema_sql
      }
      if (connectionUri) {
        payload.connection_uri = connectionUri
      }

      const response = await axios.post("http://127.0.0.1:8000/api/clarification/", payload)
      const aiData = response.data

      if (aiData.status === "needs_clarification") {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            status: "needs_clarification",
            content: aiData.message,
            rawContent: aiData.message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      } else if (aiData.status === "complete") {
        const { sql_query, explanation, tables_identified } = aiData.extracted_data || {}
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            status: "complete",
            message: aiData.message,
            explanation,
            tables: tables_identified || [],
            sql_query,
            rawContent: `${aiData.message || ""} ${explanation || ""} SQL: ${sql_query || ""}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          status: "error",
          content: "Failed to connect to backend server at http://127.0.0.1:8000. Ensure FastAPI is running.",
          rawContent: "Error connecting to backend.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopySQL = async (sql, idx) => {
    if (!sql) return
    await navigator.clipboard.writeText(sql)
    setCopiedIndex(idx)
    window.setTimeout(() => setCopiedIndex(null), 1800)
  }

  const handleExecuteLive = async (sql, idx) => {
    if (!connectionUri) {
      setIsModalOpen(true)
      return
    }

    setExecutingIndex(idx)
    try {
      const result = await executeLiveQuery(sql)
      setQueryResults((prev) => ({
        ...prev,
        [idx]: {
          success: true,
          columns: result.columns,
          rows: result.rows,
          rowCount: result.row_count,
        },
      }))
    } catch (err) {
      setQueryResults((prev) => ({
        ...prev,
        [idx]: {
          success: false,
          error: err.response?.data?.detail || err.message,
        },
      }))
    } finally {
      setExecutingIndex(null)
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setQueryResults({})
  }

  return (
    <main className="relative flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      
      {/* Full-Screen ChatGPT-Style Chat Area */}
      <section className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        
        {/* Sleek Minimal Top Subheader */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-white/80 px-4 sm:px-6 backdrop-blur-xs">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="emerald" className="gap-1.5 font-semibold text-xs py-0.5">
              <span className="size-2 rounded-full bg-[#4ca873] animate-pulse" />
              Llama-3.1 70B Engine
            </Badge>
            <span className="text-[#a1b0a6]">•</span>
            <span className="text-[#5f7065] truncate max-w-[200px] sm:max-w-xs font-medium">
              {dbInfo ? `Live DB: ${dbInfo.host}` : "Demo Schema Grounded"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!dbInfo && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="gap-1 text-xs"
              >
                <Cloud className="size-3 text-[#3aa363]" />
                <span className="hidden sm:inline">Connect Cloud DB</span>
                <span className="sm:hidden">Connect DB</span>
              </Button>
            )}

            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                className="gap-1 text-xs"
                title="Clear conversation"
              >
                <Trash2 className="size-3 text-[#708277]" />
                <span className="hidden sm:inline">Clear Chat</span>
              </Button>
            )}

            {/* Toggle Live Schema Helper Sidebar Button */}
            <Button
              variant={isHelperOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setIsHelperOpen(!isHelperOpen)}
              className="gap-1.5 text-xs transition-all duration-150"
              title={isHelperOpen ? "Collapse Live Schema Helper" : "Expand Live Schema Helper"}
            >
              {isHelperOpen ? <PanelRightClose className="size-3.5 text-[#246944]" /> : <PanelRightOpen className="size-3.5" />}
              <span className="hidden md:inline font-semibold">Live Schema Helper</span>
            </Button>
          </div>
        </div>

        {/* Scrollable Message Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl sm:max-w-4xl space-y-6">
            
            {/* Empty State / Welcome Screen */}
            {messages.length === 0 ? (
              <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-[#1f2d24] text-[#71c897] shadow-sm hover:scale-105 transition-transform">
                  <Sparkles className="size-7" />
                </div>
                
                <h1 className="text-2xl font-semibold tracking-tight text-[#1f2d24] sm:text-3xl">
                  What PostgreSQL query would you like to build?
                </h1>
                
                <p className="mt-2 max-w-lg text-xs sm:text-sm text-[#66776d] leading-relaxed">
                  {dbInfo ? (
                    <>
                      Grounded strictly in your live cloud database <strong className="text-[#206642]">{dbInfo.host}</strong> ({dbInfo.tables_count} tables). If details like date ranges or status filters are missing, I will ask for clarification before generating SQL.
                    </>
                  ) : (
                    "Ask any data question. If parameters like date ranges, status filters, or ranking metrics are ambiguous, the engine pauses and asks targeted questions first."
                  )}
                </p>

                <div className="mt-8 w-full max-w-2xl text-left">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6a7c71]">
                      <Lightbulb className="size-3.5 text-[#d98b2c]" />
                      Suggested Prompts
                    </span>
                    <span className="text-[11px] text-[#256a44] font-medium">Click to run</span>
                  </div>

                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {starterPrompts.map((prompt, idx) => (
                      <Card
                        key={idx}
                        onClick={() => handleSendMessage(prompt.text)}
                        className="group flex flex-col justify-between p-3.5 text-left cursor-pointer hover-lift hover:border-[#79b790] hover:bg-[#f3f9f4]"
                      >
                        <div>
                          <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-wider text-[#246b45]">
                            {prompt.type}
                          </Badge>
                          <p className="mt-1.5 font-medium text-xs text-[#1f2d24] group-hover:text-[#185333]">
                            "{prompt.text}"
                          </p>
                        </div>
                        <p className="mt-2 text-[11px] text-[#718277]">
                          {prompt.desc}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
                      <Bot className="size-4" />
                    </div>
                  )}

                  <div className="max-w-2xl sm:max-w-3xl space-y-2">
                    {/* User Message Bubble */}
                    {msg.role === "user" ? (
                      <div className="rounded-2xl rounded-tr-xs bg-[#1f2d24] px-4.5 py-3 text-sm leading-relaxed text-white shadow-xs font-medium">
                        {msg.content}
                      </div>
                    ) : msg.status === "needs_clarification" ? (
                      /* Clarification Required Card */
                      <div className="rounded-2xl rounded-tl-xs border border-[#ecd9be] bg-[#fdf9f2] p-4 text-sm text-[#4e3519] shadow-xs">
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#a5651c]">
                          <HelpCircle className="size-4 text-[#d98b2c]" />
                          Clarification Required
                        </div>
                        <p className="leading-relaxed text-[#513a21] text-xs sm:text-sm font-normal">
                          {msg.content}
                        </p>
                      </div>
                    ) : msg.status === "complete" ? (
                      /* Complete SQL Result Card */
                      <Card className="space-y-3.5 rounded-2xl rounded-tl-xs p-5 shadow-xs">
                        {msg.message && (
                          <div className="flex items-center gap-2 font-semibold text-[#1f2d24]">
                            <ShieldCheck className="size-4 text-[#358655]" />
                            <span>{msg.message}</span>
                          </div>
                        )}

                        {msg.explanation && (
                          <p className="text-xs leading-relaxed text-[#56685d]">
                            {msg.explanation}
                          </p>
                        )}

                        {msg.tables?.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#798a80]">
                              Tables:
                            </span>
                            {msg.tables.map((t) => (
                              <Badge
                                key={t}
                                variant="secondary"
                                className="font-mono text-[11px] font-medium text-[#205d3c]"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {msg.sql_query && (
                          <div className="overflow-hidden rounded-xl border border-[#27382d] bg-[#17231c] shadow-xs">
                            <div className="flex items-center justify-between border-b border-white/10 bg-[#121c16] px-4 py-2 text-[11px] text-[#86a894]">
                              <span className="flex items-center gap-1.5 font-mono">
                                <Code2 className="size-3.5 text-[#4ca873]" />
                                PostgreSQL (Read-Only)
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="emerald"
                                  size="sm"
                                  onClick={() => handleExecuteLive(msg.sql_query, idx)}
                                  disabled={executingIndex === idx}
                                  className="h-7 text-xs font-semibold"
                                >
                                  {executingIndex === idx ? (
                                    <>
                                      <Loader2 className="size-3 animate-spin" />
                                      <span>Running...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Play className="size-3" />
                                      <span>{connectionUri ? "Run on DB" : "Connect DB & Run"}</span>
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="darkGhost"
                                  size="sm"
                                  onClick={() => handleCopySQL(msg.sql_query, idx)}
                                  className="h-7 text-xs"
                                >
                                  {copiedIndex === idx ? (
                                    <>
                                      <Check className="size-3 text-[#4ca873]" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-3" />
                                      <span>Copy SQL</span>
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-[#d7f1df]">
                              <code>{msg.sql_query}</code>
                            </pre>
                          </div>
                        )}

                        {/* Live Query Results Table */}
                        {queryResults[idx] && (
                          <div className="mt-3 rounded-xl border border-[#d2e2d6] bg-white p-3.5 shadow-2xs">
                            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#eaf0eb]">
                              <div className="flex items-center gap-2">
                                <Table2 className="size-4 text-[#206642]" />
                                <span className="text-xs font-bold text-[#1f2d24]">
                                  Live Cloud Query Result
                                </span>
                              </div>
                              <span className="text-[11px] text-[#55695e]">
                                {queryResults[idx].rowCount} row(s) returned
                              </span>
                            </div>

                            {queryResults[idx].success ? (
                              queryResults[idx].rows?.length > 0 ? (
                                <div className="max-h-60 overflow-auto rounded-lg border border-[#e1e9e2]">
                                  <table className="w-full text-left font-mono text-[11px]">
                                    <thead className="sticky top-0 bg-[#f4f7f5] text-[#2d4838]">
                                      <tr>
                                        {queryResults[idx].columns.map((col) => (
                                          <th key={col} className="p-2 font-bold border-b border-[#e1e9e2]">
                                            {col}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#edf2ee]">
                                      {queryResults[idx].rows.map((row, rIdx) => (
                                        <tr key={rIdx} className="hover:bg-[#f9fbf9]">
                                          {queryResults[idx].columns.map((col) => (
                                            <td key={col} className="p-2 text-[#35483d] whitespace-nowrap">
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
                              <div className="text-xs text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200">
                                <strong>Execution Error:</strong> {queryResults[idx].error}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ) : (
                      <div className="rounded-2xl rounded-tl-xs border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                        {msg.content}
                      </div>
                    )}

                    <div
                      className={`text-[10px] text-[#86978d] ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#e2ece4] text-[#445b4c] shadow-xs">
                      <User className="size-4" />
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex gap-3 sm:gap-4 animate-in fade-in duration-200">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897]">
                  <Bot className="size-4" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-border bg-white px-4 py-3 text-xs text-[#63746a] shadow-xs">
                  <span className="size-3 animate-spin rounded-full border-2 border-[#4ca873] border-t-transparent" />
                  Reasoning over schema constraints, parameters &amp; rules...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ChatGPT-Style Centered Floating Bottom Input Dock */}
        <div className="shrink-0 bg-gradient-to-t from-background via-background to-transparent px-4 pb-4 sm:pb-6 pt-2">
          <div className="mx-auto max-w-3xl sm:max-w-4xl">
            <div className="relative rounded-2xl border border-input bg-white p-2 shadow-sm focus-within:border-[#4ca873] focus-within:ring-4 focus-within:ring-[#4ca873]/10 transition-all duration-150">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask or clarify your SQL query (e.g., 'Completed orders in last 30 days by spend')..."
                className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-[#1f2d24] outline-none placeholder:text-[#9aa59d] max-h-44"
              />

              <div className="flex items-center justify-between border-t border-[#f1f5f1] pt-2 px-1">
                <div className="flex items-center gap-1.5 text-[11px] text-[#788a7f]">
                  <span className="hidden sm:inline">Shift + Enter for newline</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Enter to submit</span>
                </div>

                <Button
                  type="button"
                  variant="default"
                  size="iconSm"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  className="rounded-xl shadow-xs"
                  aria-label="Send message"
                >
                  <ArrowUp className="size-4" />
                </Button>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] text-[#86978c]">
              PostgreSQL Text-to-SQL Engine evaluates intent, asks clarifying questions, and executes safe read-only SELECT queries.
            </p>
          </div>
        </div>

      </section>

      {/* Full-Height Collapsible Live Schema Helper Panel */}
      {isHelperOpen && (
        <aside className="w-80 xl:w-96 shrink-0 border-l border-border bg-white h-full overflow-y-auto flex flex-col animate-in slide-in-from-right-10 duration-200 shadow-xs">
          
          {/* Helper Header */}
          <div className="sticky top-0 z-10 border-b border-border bg-white/95 px-4 py-3.5 backdrop-blur-xs flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Database className="size-4 text-[#216b44]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e6138]">
                  Live Schema Helper
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] text-[#6f8075]">
                {dbInfo ? `Grounded in ${dbInfo.host}` : "PostgreSQL • Live tables and typed constraints."}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleCollapseAll}
                className="h-7 text-[10px] font-semibold"
                title="Toggle expand/collapse all tables"
              >
                {schemaTables.every((t) => collapsedTables[t.table_name || t.table])
                  ? "Expand All"
                  : "Collapse All"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="iconSm"
                onClick={() => setIsHelperOpen(false)}
                className="h-7 w-7 text-[#6e8074]"
                title="Close Schema Helper"
              >
                <PanelRightClose className="size-4" />
              </Button>
            </div>
          </div>

          {/* Table List with Accordion Collapse */}
          <div className="flex-1 p-3.5 space-y-2.5">
            {schemaTables.map((item) => {
              const tableName = item.table_name || item.table
              const isCollapsed = !!collapsedTables[tableName]
              const cols = item.columns || []

              return (
                <Card
                  key={tableName}
                  className="rounded-xl border-border bg-[#f9fbf9] transition-all p-0 overflow-hidden"
                >
                  {/* Clickable Table Header (Accordion Trigger) */}
                  <button
                    type="button"
                    onClick={() => toggleTableCollapse(tableName)}
                    className="flex w-full items-center justify-between p-2.5 text-left transition hover:bg-[#f1f6f2]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isCollapsed ? (
                        <ChevronRight className="size-3.5 text-[#5e7467] shrink-0" />
                      ) : (
                        <ChevronDown className="size-3.5 text-[#246944] shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="font-mono font-bold text-xs text-[#1f2d24]">
                          {tableName}
                        </span>
                        {item.description && (
                          <p className="text-[10px] text-[#77897e] truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Badge variant="secondary" className="font-mono text-[10px] font-medium text-[#205e3b]">
                        {cols.length} cols
                      </Badge>
                    </div>
                  </button>

                  {/* Collapsible Column Details */}
                  {!isCollapsed && (
                    <div className="border-t border-border px-2.5 pb-2.5 pt-2 space-y-1 bg-white">
                      {cols.map((col) => {
                        const colName = typeof col === "string" ? col : col.name
                        const colType = typeof col === "string" ? "TEXT" : col.type
                        const isPk = col?.is_primary_key
                        const isFk = col?.is_foreign_key

                        return (
                          <div
                            key={colName}
                            className="flex items-center justify-between rounded-lg border border-border bg-[#fbfdfb] px-2 py-1 font-mono text-[10px] shadow-3xs"
                          >
                            <span className="flex items-center gap-1 font-medium text-[#2d4336] truncate">
                              {isPk && (
                                <Key className="size-2.5 text-[#d98b2c] shrink-0" title="Primary Key" />
                              )}
                              {isFk && (
                                <span
                                  className="rounded bg-[#e5f5ea] px-1 text-[8px] font-bold text-[#1f663c] shrink-0"
                                  title={`Foreign Key: ${col.references || ""}`}
                                >
                                  FK
                                </span>
                              )}
                              <span className="truncate">{colName}</span>
                            </span>
                            <Badge variant="outline" className="px-1.5 py-0.5 text-[9px] text-[#55695e] shrink-0 ml-1">
                              {colType}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Bottom Connect / Switch DB Button */}
          <div className="border-t border-border p-3 bg-[#fbfdfb]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="w-full gap-1.5 text-xs font-semibold text-[#1e6138] hover:bg-[#edf7f1]"
            >
              <Cloud className="size-3.5 text-[#3aa363]" />
              <span>{dbInfo ? "Switch Cloud Database" : "Connect Your Cloud DB"}</span>
            </Button>
          </div>

        </aside>
      )}

    </main>
  )
}