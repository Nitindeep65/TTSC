'use client'

import React, { useState, useEffect } from "react"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Cloud,
  Copy,
  Database,
  Eye,
  EyeOff,
  ExternalLink,
  HardDrive,
  Layers,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  Unplug,
  X,
  Cpu,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"

const providerTemplates = [
  {
    id: "supabase",
    name: "Supabase",
    category: "sql",
    badge: "PostgreSQL",
    color: "#3ecf8e",
    placeholder: "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres",
    helper: "Found in Supabase Dashboard -> Project Settings -> Database -> Connection string (URI).",
    docUrl: "https://supabase.com/docs/guides/database/connecting-to-postgres",
  },
  {
    id: "neon",
    name: "Neon",
    category: "sql",
    badge: "Serverless Postgres",
    color: "#00e599",
    placeholder: "postgresql://[USER]:[PASSWORD]@ep-[ID].region.aws.neon.tech/neondb?sslmode=require",
    helper: "Found in Neon Console -> Dashboard -> Connection Details -> Connection string.",
    docUrl: "https://neon.tech/docs/connect/connect-from-any-app",
  },
  {
    id: "mongodb",
    name: "MongoDB Atlas",
    category: "nosql",
    badge: "NoSQL Document",
    color: "#00ed64",
    placeholder: "mongodb+srv://[USER]:[PASSWORD]@[CLUSTER].mongodb.net/[DBNAME]?retryWrites=true&w=majority",
    helper: "Found in MongoDB Atlas -> Clusters -> Connect -> Drivers / Connection String.",
    docUrl: "https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/",
  },
  {
    id: "redis",
    name: "Redis / Upstash",
    category: "cache",
    badge: "Key-Value Cache",
    color: "#dc382d",
    placeholder: "redis://default:[PASSWORD]@[ENDPOINT]:6379",
    helper: "Found in Redis Cloud / Upstash Console -> Details -> Redis Connection URI.",
    docUrl: "https://redis.io/docs/latest/develop/connect/clients/",
  },
  {
    id: "dynamodb",
    name: "Amazon DynamoDB",
    category: "nosql",
    badge: "AWS NoSQL",
    color: "#ff9900",
    placeholder: "https://dynamodb.[REGION].amazonaws.com (or local endpoint http://localhost:8000)",
    helper: "AWS Region endpoint or local DynamoDB emulator connection endpoint.",
    docUrl: "https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html",
  },
  {
    id: "rds",
    name: "AWS RDS Postgres",
    category: "sql",
    badge: "AWS Relational",
    color: "#ff9900",
    placeholder: "postgresql://[USER]:[PASSWORD]@[ENDPOINT].rds.amazonaws.com:5432/[DBNAME]",
    helper: "Found in AWS RDS Console -> Databases -> Connectivity & Security -> Endpoint.",
    docUrl: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html",
  },
  {
    id: "mysql",
    name: "MySQL / MariaDB",
    category: "sql",
    badge: "Relational SQL",
    color: "#00758f",
    placeholder: "mysql://[USER]:[PASSWORD]@[HOST]:3306/[DBNAME]",
    helper: "Standard MySQL connection URI with host, port, user credentials, and database name.",
    docUrl: "https://dev.mysql.com/doc/refman/8.0/en/connecting.html",
  },
  {
    id: "custom",
    name: "Custom PostgreSQL",
    category: "sql",
    badge: "Self-Hosted",
    color: "#336791",
    placeholder: "postgresql://postgres:password@your-host.com:5432/mydb",
    helper: "Standard PostgreSQL connection URI string with credentials and host.",
    docUrl: "https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING",
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

  const [activeCategory, setActiveCategory] = useState("all") // "all" | "sql" | "nosql" | "cache"
  const [activeProvider, setActiveProvider] = useState("supabase")
  const [inputUri, setInputUri] = useState(() => connectionUri || "")
  const [showPassword, setShowPassword] = useState(false)
  const [testSuccess, setTestSuccess] = useState(false)

  if (!isModalOpen) return null

  const handleSelectTemplate = (providerId) => {
    setActiveProvider(providerId)
    const tmpl = providerTemplates.find((p) => p.id === providerId)
    if (tmpl && !connectionUri) {
      if (!inputUri || providerTemplates.some((p) => p.placeholder === inputUri)) {
        setInputUri("")
      }
    }
  }

  const filteredProviders = activeCategory === "all"
    ? providerTemplates
    : providerTemplates.filter((p) => p.category === activeCategory)

  const handleConnect = async (e) => {
    e?.preventDefault()
    if (!inputUri.trim()) return

    const ok = await connectToDatabase(inputUri.trim())
    if (ok) {
      setTestSuccess(true)
      setTimeout(() => setTestSuccess(false), 2000)
    }
  }

  const selectedProvider = providerTemplates.find((p) => p.id === activeProvider)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#dfe7df] bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e6ede6] bg-[#fbfdfb] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897]">
              <Database className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#1f2d24]">Connect SQL or NoSQL Database</h2>
              <p className="text-xs text-[#6e8074]">
                Introspect live schemas &amp; collections from PostgreSQL, MySQL, MongoDB, Redis, or DynamoDB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="flex size-8 items-center justify-center rounded-lg text-[#6e8074] transition hover:bg-[#eef4ef] hover:text-[#1f2d24]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-5">
          
          {/* Active Connection Status Banner */}
          {dbInfo ? (
            <div className="rounded-xl border border-[#cbe3d2] bg-[#f0faf3] p-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-[#1f663c]">
                  <CheckCircle2 className="size-4 text-[#3ba565]" />
                  <span>Currently Connected to Database</span>
                </div>
                <button
                  type="button"
                  onClick={disconnectDatabase}
                  className="inline-flex items-center gap-1 rounded-md border border-[#c3ded0] bg-white px-2.5 py-1 text-xs font-medium text-red-600 shadow-2xs hover:bg-red-50"
                >
                  <Unplug className="size-3" />
                  Disconnect
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 font-mono sm:grid-cols-4 text-[11px] text-[#335340]">
                <div className="rounded-lg bg-white/80 p-2 border border-[#d6ebd9]">
                  <span className="block text-[9px] uppercase tracking-wider text-[#70947c]">Host</span>
                  <span className="truncate block font-semibold">{dbInfo.host}</span>
                </div>
                <div className="rounded-lg bg-white/80 p-2 border border-[#d6ebd9]">
                  <span className="block text-[9px] uppercase tracking-wider text-[#70947c]">Database</span>
                  <span className="truncate block font-semibold">{dbInfo.database}</span>
                </div>
                <div className="rounded-lg bg-white/80 p-2 border border-[#d6ebd9]">
                  <span className="block text-[9px] uppercase tracking-wider text-[#70947c]">User / Auth</span>
                  <span className="truncate block font-semibold">{dbInfo.user}</span>
                </div>
                <div className="rounded-lg bg-white/80 p-2 border border-[#d6ebd9]">
                  <span className="block text-[9px] uppercase tracking-wider text-[#70947c]">Entities</span>
                  <span className="block font-semibold text-[#227244]">{dbInfo.tables_count} live schemas</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Engine Category Tabs & Provider Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#697b70]">
                Select Database Engine
              </label>
              <div className="flex items-center gap-1 bg-[#f0f4f1] p-0.5 rounded-lg text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-2 py-0.5 rounded-md transition ${activeCategory === "all" ? "bg-white text-[#1f2d24] shadow-xs" : "text-[#627568]"}`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("sql")}
                  className={`px-2 py-0.5 rounded-md transition ${activeCategory === "sql" ? "bg-white text-[#1f2d24] shadow-xs" : "text-[#627568]"}`}
                >
                  Relational SQL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("nosql")}
                  className={`px-2 py-0.5 rounded-md transition ${activeCategory === "nosql" ? "bg-white text-[#1f2d24] shadow-xs" : "text-[#627568]"}`}
                >
                  NoSQL Document
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("cache")}
                  className={`px-2 py-0.5 rounded-md transition ${activeCategory === "cache" ? "bg-white text-[#1f2d24] shadow-xs" : "text-[#627568]"}`}
                >
                  Key-Value
                </button>
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
                    className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? "border-[#206642] bg-[#f0f8f3] ring-2 ring-[#206642]/10"
                        : "border-[#e0e8e0] bg-[#fbfdfb] hover:border-[#8ec8a4] hover:bg-white"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold text-xs text-[#1f2d24]">{p.name}</span>
                    </div>
                    <span className="mt-1 inline-block rounded bg-white px-1.5 py-0.5 text-[9px] font-semibold text-[#486352] border border-[#e1eae2]">
                      {p.badge}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Connection URI Input Form */}
          <form onSubmit={handleConnect} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="conn-uri" className="text-xs font-semibold text-[#1f2d24]">
                  {selectedProvider?.name} Connection URI
                </label>
                {selectedProvider?.docUrl && (
                  <a
                    href={selectedProvider.docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-[#256a44] hover:underline"
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
                  onChange={(e) => setInputUri(e.target.value)}
                  placeholder={selectedProvider?.placeholder || "postgresql://user:pass@host:5432/dbname"}
                  className="w-full rounded-xl border border-[#cfd9cf] bg-white px-3.5 py-2.5 pr-20 font-mono text-xs text-[#1f2d24] outline-none transition focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/15"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#788a80] hover:text-[#1f2d24]"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <p className="mt-1.5 text-[11px] text-[#718278]">
                {selectedProvider?.helper}
              </p>
            </div>

            {/* Error Display */}
            {connectionError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="size-4 text-red-600" />
                  <span>Connection Notice</span>
                </div>
                <p className="text-[11px] font-mono leading-relaxed">{connectionError}</p>
                <p className="text-[10px] text-red-600 pt-1">
                  Tip: Verify your network connection string, ensure cloud firewall allows incoming connections (0.0.0.0/0), and check authentication credentials.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-[#d6e0d7] bg-white px-4 py-2 text-xs font-semibold text-[#526359] hover:bg-[#f2f6f3]"
              >
                Close
              </button>

              <button
                type="submit"
                disabled={!inputUri.trim() || isConnecting}
                className="flex items-center gap-2 rounded-xl bg-[#1f2d24] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#2e4736] disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin text-[#71c897]" />
                    <span>Discovering Schemas...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="size-3.5 text-[#71c897]" />
                    <span>Connect &amp; Introspect Live Catalog</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
