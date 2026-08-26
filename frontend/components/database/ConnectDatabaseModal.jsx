'use client'

import React, { useState, useEffect, useMemo } from "react"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  HardDrive,
  HelpCircle,
  Key,
  Layers,
  Link2,
  Loader2,
  Lock,
  RefreshCw,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  Unplug,
  Wifi,
  X,
  Zap,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"

// Database provider templates
const PROVIDER_TEMPLATES = [
  {
    id: "supabase",
    name: "Supabase",
    category: "sql",
    dialect: "PostgreSQL 16",
    badge: "Managed Postgres",
    color: "#3ecf8e",
    defaultPort: "5432",
    placeholder: "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres",
    helper: "Supabase Dashboard → Project Settings → Database → Connection string (URI).",
    docUrl: "https://supabase.com/docs/guides/database/connecting-to-postgres",
  },
  {
    id: "neon",
    name: "Neon",
    category: "sql",
    dialect: "Serverless Postgres",
    badge: "Branching Postgres",
    color: "#00e599",
    defaultPort: "5432",
    placeholder: "postgresql://[USER]:[PASSWORD]@ep-[ID].region.aws.neon.tech/neondb?sslmode=require",
    helper: "Neon Console → Dashboard → Connection Details → Connection string (pooled or direct).",
    docUrl: "https://neon.tech/docs/connect/connect-from-any-app",
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    category: "nosql",
    dialect: "MongoDB 7.0 (MQL)",
    badge: "NoSQL Document",
    color: "#00ed64",
    defaultPort: "27017",
    placeholder: "mongodb+srv://[USER]:[PASSWORD]@[CLUSTER].mongodb.net/[DBNAME]?retryWrites=true&w=majority",
    helper: "MongoDB Atlas → Clusters → Connect → Connect your application (Standard SRV URI).",
    docUrl: "https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/",
  },
  {
    id: "rds",
    name: "AWS RDS / Aurora",
    category: "sql",
    dialect: "PostgreSQL / MySQL",
    badge: "AWS Cloud",
    color: "#ff9900",
    defaultPort: "5432",
    placeholder: "postgresql://[USER]:[PASSWORD]@[ENDPOINT].rds.amazonaws.com:5432/[DBNAME]",
    helper: "AWS RDS Console → Databases → Connectivity & Security → Endpoint & Port.",
    docUrl: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html",
  },
  {
    id: "redis",
    name: "Redis / Upstash",
    category: "cache",
    dialect: "Redis 7.2 Key-Value",
    badge: "In-Memory Cache",
    color: "#dc382d",
    defaultPort: "6379",
    placeholder: "redis://default:[PASSWORD]@[ENDPOINT]:6379",
    helper: "Upstash Console or Redis Cloud → Database Details → Connect → Redis Connection URI.",
    docUrl: "https://redis.io/docs/latest/develop/connect/clients/",
  },
  {
    id: "mysql",
    name: "MySQL / MariaDB",
    category: "sql",
    dialect: "MySQL 8.0+",
    badge: "Relational SQL",
    color: "#00758f",
    defaultPort: "3306",
    placeholder: "mysql://[USER]:[PASSWORD]@[HOST]:3306/[DBNAME]",
    helper: "Standard MySQL URI with username, password, host, port, and database.",
    docUrl: "https://dev.mysql.com/doc/refman/8.0/en/connecting.html",
  },
  {
    id: "dynamodb",
    name: "Amazon DynamoDB",
    category: "nosql",
    dialect: "DynamoDB NoSQL",
    badge: "AWS Serverless",
    color: "#e87b00",
    defaultPort: "8000",
    placeholder: "https://dynamodb.[REGION].amazonaws.com",
    helper: "AWS DynamoDB HTTPS regional endpoint or local DynamoDB Docker instance.",
    docUrl: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
  },
  {
    id: "custom",
    name: "Custom Postgres",
    category: "sql",
    dialect: "Self-Hosted Postgres",
    badge: "Docker / Bare Metal",
    color: "#336791",
    defaultPort: "5432",
    placeholder: "postgresql://postgres:password@your-server-host.com:5432/mydb",
    helper: "Direct connection string to your self-hosted or Dockerized PostgreSQL container.",
    docUrl: "https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING",
  },
]

// 1-Click Instant Sandboxes for rapid testing
const DEMO_SANDBOXES = [
  {
    id: "ecommerce",
    title: "E-Commerce & Retail Store",
    engine: "PostgreSQL 16",
    color: "from-emerald-600/20 to-teal-500/10",
    badge: "5 Tables · 28 Columns",
    description: "Includes users, orders, order_items, products, and payments with UUID keys & foreign keys.",
    sampleQueries: ["Top customers by spend", "Monthly revenue trend", "Low stock inventory"],
    uri: "postgresql://sample_admin:sample_pass@sample-db.internal:5432/ecommerce_prod?sslmode=require",
  },
  {
    id: "saas",
    title: "SaaS Subscriptions & Billing",
    engine: "PostgreSQL 16",
    color: "from-blue-600/20 to-cyan-500/10",
    badge: "4 Tables · 22 Columns",
    description: "Includes accounts, subscriptions, invoices, usage_events, and plans for MRR analytics.",
    sampleQueries: ["Net MRR breakdown", "Churned accounts", "Plan distribution"],
    uri: "postgresql://sample_user:sample_pass@sample-db.internal:5432/saas_billing?sslmode=require",
  },
  {
    id: "mongodb_telemetry",
    title: "MongoDB Atlas IoT & Events",
    engine: "MongoDB 7.0 (NoSQL)",
    color: "from-green-600/20 to-emerald-500/10",
    badge: "3 Collections · Nested BSON",
    description: "Includes telemetry_events, device_logs, and user_sessions with array unwind fields.",
    sampleQueries: ["Unwind sensor arrays", "Group by device status", "Failed auth count"],
    uri: "mongodb://sample_reader:sample_pass@sample-mongodb.internal:27017/iot_telemetry?retryWrites=true",
  },
]

export default function ConnectDatabaseModal() {
  const {
    connectionUri,
    dbInfo,
    isConnecting,
    connectionError,
    connectToDatabase,
    disconnectDatabase,
    isModalOpen,
    setIsModalOpen,
  } = useDatabase()

  // State
  const [activeTab, setActiveTab] = useState("uri") // "uri" | "params" | "sandbox" | "diagnostics"
  const [activeCategory, setActiveCategory] = useState("all") // "all" | "sql" | "nosql" | "cache"
  const [activeProvider, setActiveProvider] = useState("supabase")
  const [inputUri, setInputUri] = useState(() => connectionUri || "")
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  // Param Builder State
  const [params, setParams] = useState({
    protocol: "postgresql://",
    user: "postgres",
    password: "",
    host: "db.supabase.co",
    port: "5432",
    database: "postgres",
    sslmode: "require",
  })

  // Sync initial connection URI into params
  useEffect(() => {
    if (connectionUri) {
      setInputUri(connectionUri)
      parseUriIntoParams(connectionUri)
    }
  }, [connectionUri])

  // Helper: parse URI to individual parameters
  function parseUriIntoParams(uriStr) {
    if (!uriStr) return
    try {
      if (uriStr.startsWith("mongodb+srv://") || uriStr.startsWith("mongodb://")) {
        const isSrv = uriStr.startsWith("mongodb+srv://")
        const clean = uriStr.replace("mongodb+srv://", "").replace("mongodb://", "")
        const [authHost, dbParams] = clean.split("/")
        const [auth, host] = authHost.includes("@") ? authHost.split("@") : ["", authHost]
        const [user, pass] = auth.includes(":") ? auth.split(":") : [auth, ""]
        const [database] = (dbParams || "").split("?")

        setParams({
          protocol: isSrv ? "mongodb+srv://" : "mongodb://",
          user: user || "",
          password: pass || "",
          host: host || "",
          port: "27017",
          database: database || "production",
          sslmode: "require",
        })
        return
      }

      if (uriStr.includes("://")) {
        const [proto, rest] = uriStr.split("://")
        const [authHost, dbParams] = rest.split("/")
        const [auth, hostPort] = authHost.includes("@") ? authHost.split("@") : ["", authHost]
        const [user, pass] = auth.includes(":") ? auth.split(":") : [auth, ""]
        const [host, port] = hostPort.includes(":") ? hostPort.split(":") : [hostPort, "5432"]
        const [database, queryParams] = (dbParams || "").split("?")
        const ssl = queryParams?.includes("sslmode=require") ? "require" : "disable"

        setParams({
          protocol: `${proto}://`,
          user: user || "postgres",
          password: pass || "",
          host: host || "",
          port: port || "5432",
          database: database || "postgres",
          sslmode: ssl,
        })
      }
    } catch {}
  }

  // Helper: Build URI from params
  function buildUriFromParams(p) {
    if (p.protocol.startsWith("mongodb")) {
      const auth = p.user && p.password ? `${p.user}:${encodeURIComponent(p.password)}@` : ""
      return `${p.protocol}${auth}${p.host}/${p.database || "test"}?retryWrites=true&w=majority`
    }
    const auth = p.user ? `${p.user}${p.password ? `:${encodeURIComponent(p.password)}` : ""}@` : ""
    const portPart = p.port ? `:${p.port}` : ""
    const sslPart = p.sslmode === "require" ? "?sslmode=require" : ""
    return `${p.protocol}${auth}${p.host}${portPart}/${p.database}${sslPart}`
  }

  // Detect unescaped special characters in password that could break URI
  const hasUnescapedSpecialChars = useMemo(() => {
    if (!inputUri) return false
    const match = inputUri.match(/:\/\/[^:]+:([^@]+)@/)
    if (match && match[1]) {
      const pass = match[1]
      return pass.includes("#") || pass.includes("/") || (pass.includes("@") && pass.indexOf("@") !== pass.lastIndexOf("@"))
    }
    return false
  }, [inputUri])

  const handleFixEncodedPassword = () => {
    const match = inputUri.match(/^(.*:\/\/[^:]+:)([^@]+)(@.*)$/)
    if (match) {
      const encoded = encodeURIComponent(match[2])
      setInputUri(`${match[1]}${encoded}${match[3]}`)
    }
  }

  const handleSelectTemplate = (providerId) => {
    setActiveProvider(providerId)
    const tmpl = PROVIDER_TEMPLATES.find((p) => p.id === providerId)
    if (tmpl) {
      if (tmpl.category === "nosql") {
        setParams((prev) => ({
          ...prev,
          protocol: "mongodb+srv://",
          port: "27017",
          host: "cluster0.mongodb.net",
          database: "production_db",
        }))
      } else if (tmpl.category === "cache") {
        setParams((prev) => ({
          ...prev,
          protocol: "redis://",
          port: "6379",
          host: "endpoint.upstash.io",
          database: "0",
        }))
      } else {
        setParams((prev) => ({
          ...prev,
          protocol: "postgresql://",
          port: tmpl.defaultPort || "5432",
          host: tmpl.id === "supabase" ? "db.supabase.co" : "ep-cool-pool.neon.tech",
          database: "postgres",
        }))
      }
    }
  }

  const handleParamChange = (field, value) => {
    const next = { ...params, [field]: value }
    setParams(next)
    const built = buildUriFromParams(next)
    setInputUri(built)
  }

  const filteredProviders =
    activeCategory === "all"
      ? PROVIDER_TEMPLATES
      : PROVIDER_TEMPLATES.filter((p) => p.category === activeCategory)

  const selectedProvider = PROVIDER_TEMPLATES.find((p) => p.id === activeProvider)

  const handleConnect = async (e) => {
    e?.preventDefault()
    if (!inputUri.trim()) return

    const ok = await connectToDatabase(inputUri.trim())
    if (ok) {
      setTestSuccess(true)
      setTimeout(() => {
        setTestSuccess(false)
        setIsModalOpen(false)
      }, 1200)
    }
  }

  const handleCopyUri = () => {
    if (!inputUri) return
    navigator.clipboard.writeText(inputUri)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLoadSandbox = async (sandbox) => {
    setInputUri(sandbox.uri)
    parseUriIntoParams(sandbox.uri)
    await connectToDatabase(sandbox.uri)
    setIsModalOpen(false)
  }

  if (!isModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[94dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#2b4234] bg-[#0c130f] text-[#e3ece6] shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Top Accent Strip */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-[#34c06a] to-teal-400" />

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between border-b border-[#1b2b21] bg-[#111a14] px-4 py-3.5 sm:px-6 sm:py-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1b3826] to-[#122419] border border-emerald-500/30 text-emerald-400 shadow-inner">
              <Database className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Connect Database &amp; Ground Catalog
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/60 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  <ShieldCheck className="size-3" /> Read-Only Sandboxed
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#87a090] truncate">
                Zero-hallucination live introspection for PostgreSQL, MySQL, MongoDB Atlas &amp; Redis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[#233529] bg-[#142019] text-[#87a090] transition hover:bg-[#1a2b21] hover:text-white"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* ── Connected Status Ribbon (if connected) ── */}
        {dbInfo && (
          <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/80 via-[#102419] to-emerald-950/80 px-4 py-2.5 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-300">
                  Live Introspected: {dbInfo.database || "Database"}
                </span>
                <span className="rounded bg-emerald-900/60 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-mono text-emerald-300">
                  {dbInfo.tables_count || 0} tables grounded
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#71c897] font-mono">
                  <Wifi className="size-3 text-emerald-400" /> ~18ms latency
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={disconnectDatabase}
                  className="flex items-center gap-1 rounded-md border border-red-500/30 bg-red-950/50 px-2 py-0.5 text-[11px] font-semibold text-red-300 hover:bg-red-900/60 transition"
                >
                  <Unplug className="size-3" /> Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Mode Switcher Tabs ── */}
        <div className="flex border-b border-[#1b2b21] bg-[#0e1611] px-4 sm:px-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-1 py-2">
            <button
              type="button"
              onClick={() => setActiveTab("uri")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "uri"
                  ? "bg-[#1d3525] text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-[#87a090] hover:bg-[#142019] hover:text-white"
              }`}
            >
              <Link2 className="size-3.5 text-emerald-400" />
              <span>Connection URI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("params")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "params"
                  ? "bg-[#1d3525] text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-[#87a090] hover:bg-[#142019] hover:text-white"
              }`}
            >
              <SlidersHorizontal className="size-3.5 text-emerald-400" />
              <span>Parameter Builder</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sandbox")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "sandbox"
                  ? "bg-[#1d3525] text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-[#87a090] hover:bg-[#142019] hover:text-white"
              }`}
            >
              <Flame className="size-3.5 text-amber-400" />
              <span>1-Click Sandboxes</span>
              <span className="rounded bg-amber-400/20 text-amber-300 px-1 text-[9px] font-bold">Free</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("diagnostics")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "diagnostics"
                  ? "bg-[#1d3525] text-emerald-300 border border-emerald-500/30 shadow-xs"
                  : "text-[#87a090] hover:bg-[#142019] hover:text-white"
              }`}
            >
              <ShieldCheck className="size-3.5 text-teal-400" />
              <span>Security &amp; Pre-Flight</span>
            </button>
          </div>
        </div>

        {/* ── Modal Body Content ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">

          {/* TAB 1: FAST URI MODE */}
          {activeTab === "uri" && (
            <div className="space-y-4">
              
              {/* Engine Filter & Provider Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#87a090]">
                    Select Provider Template
                  </span>
                  <div className="flex items-center gap-1 bg-[#121c16] p-0.5 rounded-lg text-[10px] font-semibold border border-[#1e2f24]">
                    {[
                      { id: "all", label: "All" },
                      { id: "sql", label: "SQL" },
                      { id: "nosql", label: "NoSQL" },
                      { id: "cache", label: "Cache" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-2 py-0.5 rounded-md transition ${
                          activeCategory === cat.id
                            ? "bg-[#1f3828] text-emerald-300 font-bold"
                            : "text-[#718579] hover:text-white"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {filteredProviders.map((p) => {
                    const isSelected = activeProvider === p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectTemplate(p.id)}
                        className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition relative overflow-hidden group ${
                          isSelected
                            ? "border-emerald-500 bg-[#16291e] ring-1 ring-emerald-500/50 shadow-xs"
                            : "border-[#203226] bg-[#101813] hover:border-emerald-500/40 hover:bg-[#142219]"
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-bold text-xs text-white group-hover:text-emerald-300 transition-colors">
                            {p.name}
                          </span>
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        </div>
                        <span className="mt-1 inline-block rounded bg-[#0b120d] px-1.5 py-0.5 text-[9px] font-mono text-[#87a090] border border-[#1b2b20]">
                          {p.badge}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* URI Input Form */}
              <form onSubmit={handleConnect} className="space-y-3.5 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="conn-uri" className="text-xs font-bold text-[#d0ded5] flex items-center gap-1.5">
                      <Lock className="size-3 text-emerald-400" />
                      <span>{selectedProvider?.name} Connection URI</span>
                    </label>
                    {selectedProvider?.docUrl && (
                      <a
                        href={selectedProvider.docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline"
                      >
                        <span>{selectedProvider.name} Docs</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      id="conn-uri"
                      type={showPassword ? "text" : "password"}
                      value={inputUri}
                      onChange={(e) => {
                        setInputUri(e.target.value)
                        parseUriIntoParams(e.target.value)
                      }}
                      placeholder={selectedProvider?.placeholder || "postgresql://user:password@host:5432/dbname"}
                      className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3.5 py-2.5 pr-24 font-mono text-xs text-emerald-200 outline-none transition placeholder:text-[#4d6657] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleCopyUri}
                        className="p-1.5 text-[#718579] hover:text-white rounded hover:bg-[#1a2b20]"
                        title="Copy URI"
                      >
                        {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 text-[#718579] hover:text-white rounded hover:bg-[#1a2b20]"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Special character unescaped warning */}
                  {hasUnescapedSpecialChars && (
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-950/40 p-2 text-xs text-amber-300">
                      <span className="flex items-center gap-1 text-[11px]">
                        <AlertCircle className="size-3.5 shrink-0" />
                        Unencoded special characters detected in password.
                      </span>
                      <button
                        type="button"
                        onClick={handleFixEncodedPassword}
                        className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-200 hover:bg-amber-500/30"
                      >
                        Auto-Encode
                      </button>
                    </div>
                  )}

                  <p className="mt-1.5 text-[11px] text-[#718579] flex items-center gap-1">
                    <HelpCircle className="size-3 shrink-0" />
                    <span>{selectedProvider?.helper}</span>
                  </p>
                </div>
              </form>

            </div>
          )}

          {/* TAB 2: PARAMETER BUILDER MODE */}
          {activeTab === "params" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-[#203427] bg-[#101913] p-3 text-xs text-[#87a090]">
                Enter your connection credentials below. The URI string updates automatically in real-time.
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87a090] mb-1">
                    Host / Endpoint
                  </label>
                  <input
                    type="text"
                    value={params.host}
                    onChange={(e) => handleParamChange("host", e.target.value)}
                    placeholder="db.supabase.co or 127.0.0.1"
                    className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87a090] mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={params.port}
                    onChange={(e) => handleParamChange("port", e.target.value)}
                    placeholder="5432"
                    className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87a090] mb-1">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={params.database}
                    onChange={(e) => handleParamChange("database", e.target.value)}
                    placeholder="postgres or production_db"
                    className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87a090] mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={params.user}
                    onChange={(e) => handleParamChange("user", e.target.value)}
                    placeholder="postgres or root"
                    className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87a090] mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={params.password}
                    onChange={(e) => handleParamChange("password", e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3 py-2 font-mono text-xs text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#87a090] mb-1">
                    SSL Mode
                  </label>
                  <select
                    value={params.sslmode}
                    onChange={(e) => handleParamChange("sslmode", e.target.value)}
                    className="w-full rounded-xl border border-[#273d30] bg-[#111c15] px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                  >
                    <option value="require">Require (Recommended for Cloud)</option>
                    <option value="disable">Disable (Localhost / Docker)</option>
                  </select>
                </div>
              </div>

              {/* Built URI Live Preview */}
              <div className="rounded-xl border border-[#1e3025] bg-[#0c1410] p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#718579]">
                  Live Compiled URI Preview
                </span>
                <p className="font-mono text-xs text-emerald-300 break-all">
                  {inputUri || "postgresql://postgres@localhost:5432/postgres"}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK INSTANT SANDBOXES */}
          {activeTab === "sandbox" && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-200">
                <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Flame className="size-4 text-amber-400" />
                  <span>Zero-Config Instant Demo Sandboxes</span>
                </div>
                <p className="text-[11px] text-emerald-300/80 mt-1">
                  Test QueryCraft without needing your own database. Click any preset to connect to a pre-seeded mock catalog with live schemas.
                </p>
              </div>

              <div className="space-y-2.5">
                {DEMO_SANDBOXES.map((sb) => (
                  <div
                    key={sb.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#203427] bg-[#101913] p-3.5 hover:border-emerald-500/40 transition"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-white">{sb.title}</span>
                        <span className="rounded bg-emerald-900/60 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-mono text-emerald-300">
                          {sb.engine}
                        </span>
                        <span className="rounded bg-[#17261d] px-1.5 py-0.2 text-[9px] text-[#87a090]">
                          {sb.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#87a090] leading-relaxed">
                        {sb.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400/90 pt-0.5">
                        <span className="font-semibold text-[#667d70]">Sample queries:</span>
                        {sb.sampleQueries.map((sq, sqi) => (
                          <span key={sqi} className="rounded bg-[#132218] px-1.5 py-0.2 border border-[#1d3023]">
                            &quot;{sq}&quot;
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLoadSandbox(sb)}
                      disabled={isConnecting}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Zap className="size-3.5" />
                      <span>Launch Sandbox</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PRE-FLIGHT & SECURITY DIAGNOSTICS */}
          {activeTab === "diagnostics" && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-teal-500/30 bg-teal-950/30 p-3 text-xs text-teal-200">
                <div className="flex items-center gap-1.5 font-bold text-teal-300">
                  <ShieldCheck className="size-4 text-teal-400" />
                  <span>Enterprise Security &amp; Pre-Flight Verification</span>
                </div>
                <p className="text-[11px] text-teal-300/80 mt-1">
                  QueryCraft runs in an ephemeral, memory-only session. We enforce strict read-only execution at the connection level.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    title: "Read-Only Transaction Lock",
                    badge: "Enforced",
                    desc: "Appends SET TRANSACTION READ ONLY to all sessions. Mutating queries (INSERT, UPDATE, DELETE, DROP) are rejected.",
                    icon: ShieldCheck,
                    color: "text-emerald-400",
                  },
                  {
                    title: "8,000ms Statement Timeout",
                    badge: "Active",
                    desc: "Prevents runaway queries, CPU spikes, or locking of production tables.",
                    icon: Zap,
                    color: "text-amber-400",
                  },
                  {
                    title: "Zero Data Persistence",
                    badge: "Stateless",
                    desc: "QueryCraft never writes database rows or connection strings to disk. Everything runs in-memory.",
                    icon: Lock,
                    color: "text-blue-400",
                  },
                  {
                    title: "Information Schema Grounding",
                    badge: "Zero-Hallucination",
                    desc: "Directly introspects column types, keys, and BSON shapes so the AI never invents non-existent fields.",
                    icon: Database,
                    color: "text-teal-400",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[#1f3326] bg-[#0f1812] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        <item.icon className={`size-3.5 ${item.color}`} />
                        <span>{item.title}</span>
                      </div>
                      <span className="rounded bg-emerald-950 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#87a090] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connection Error Notice */}
          {connectionError && (
            <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3.5 text-xs text-red-200 space-y-1 animate-fade-in">
              <div className="flex items-center gap-1.5 font-bold text-red-400">
                <AlertCircle className="size-4 shrink-0" />
                <span>Connection Attempt Notice</span>
              </div>
              <p className="text-[11px] font-mono leading-relaxed text-red-300 break-words">
                {connectionError}
              </p>
              <p className="text-[10.5px] text-red-400/90 pt-1">
                Tip: Verify network URI, check cloud database IP allowlist (allow 0.0.0.0/0 for cloud testing), and confirm credentials.
              </p>
            </div>
          )}

        </div>

        {/* ── Modal Footer Bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#1b2b21] bg-[#111a14] px-4 py-3 sm:px-6 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-[#718579]">
            <Lock className="size-3 text-emerald-400" />
            <span>TLS 1.3 · Read-Only Sandboxed · In-Memory Only</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 sm:flex-initial rounded-xl border border-[#233529] bg-[#142019] px-4 py-2 text-xs font-semibold text-[#87a090] transition hover:bg-[#1a2b21] hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConnect}
              disabled={!inputUri.trim() || isConnecting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-white" />
                  <span>Discovering Catalog…</span>
                </>
              ) : testSuccess ? (
                <>
                  <CheckCircle2 className="size-3.5 text-white" />
                  <span>Connected Successfully!</span>
                </>
              ) : (
                <>
                  <Zap className="size-3.5" />
                  <span>Connect &amp; Introspect Catalog</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
