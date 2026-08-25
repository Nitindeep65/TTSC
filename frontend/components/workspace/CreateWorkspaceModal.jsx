'use client'

import React, { useState } from "react"
import {
  Check,
  CheckCircle2,
  Cloud,
  Database,
  Eye,
  EyeOff,
  FolderPlus,
  Layers,
  Loader2,
  Lock,
  Plus,
  Server,
  Sparkles,
  X,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const envOptions = [
  { label: "Production", color: "bg-emerald-500", text: "text-emerald-700" },
  { label: "Staging", color: "bg-amber-500", text: "text-amber-700" },
  { label: "Development", color: "bg-blue-500", text: "text-blue-700" },
  { label: "Analytics", color: "bg-purple-500", text: "text-purple-700" },
]

export default function CreateWorkspaceModal() {
  const {
    isWorkspaceModalOpen,
    setIsWorkspaceModalOpen,
    createWorkspace,
  } = useDatabase()

  const [name, setName] = useState("")
  const [environment, setEnvironment] = useState("Production")
  const [connectionUri, setConnectionUri] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isWorkspaceModalOpen) return null

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await createWorkspace({
        name: name.trim(),
        environment,
        connectionUri: connectionUri.trim(),
      })
      setName("")
      setConnectionUri("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyPreset = (prefix) => {
    setConnectionUri(prefix)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-[#1f2d24] text-[#71c897] shadow-xs">
              <FolderPlus className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-[#17241c] truncate">Create New Workspace</h2>
              <p className="text-[11px] sm:text-xs text-[#607266] truncate">
                Isolate schemas, queries, and databases per project
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={() => setIsWorkspaceModalOpen(false)}
            className="text-[#738478] shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1.5">
              Workspace / Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fintech RDS, Analytics Staging, SaaS Production"
              className="w-full rounded-xl border border-input bg-white px-3.5 py-2 text-xs text-[#17241c] outline-none placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
            />
          </div>

          {/* Environment Tag */}
          <div>
            <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider mb-1.5">
              Environment Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {envOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setEnvironment(opt.label)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all ${
                    environment === opt.label
                      ? "border-[#28734d] bg-[#edf6f0] text-[#1c6037] shadow-2xs"
                      : "border-border bg-white text-[#526458] hover:bg-[#f3f7f4]"
                  }`}
                >
                  <span className={`size-2 rounded-full ${opt.color}`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Database Connection URI */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#2a3e31] uppercase tracking-wider">
                Cloud Database URI (Optional)
              </label>
              <span className="text-[10px] text-[#718377]">Can connect later</span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={connectionUri}
                onChange={(e) => setConnectionUri(e.target.value)}
                placeholder="postgresql://user:password@host:5432/dbname"
                className="w-full rounded-xl border border-input bg-white px-3.5 py-2 pr-10 font-mono text-xs text-[#17241c] outline-none placeholder:text-[#9aa79e] focus:border-[#4ca873] focus:ring-3 focus:ring-[#4ca873]/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7e8f83] hover:text-[#1f2d24]"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>

            {/* Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-[#718277] font-medium">Quick presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres")}
                className="rounded bg-[#f0f5f1] px-2 py-0.5 font-semibold text-[#206642] hover:bg-[#dcefe1]"
              >
                + Supabase
              </button>
              <button
                type="button"
                onClick={() => applyPreset("postgresql://[USER]:[PASSWORD]@ep-[ID].region.aws.neon.tech/neondb?sslmode=require")}
                className="rounded bg-[#f0f5f1] px-2 py-0.5 font-semibold text-[#206642] hover:bg-[#dcefe1]"
              >
                + Neon
              </button>
              <button
                type="button"
                onClick={() => applyPreset("postgresql://[USER]:[PASSWORD]@[ENDPOINT].rds.amazonaws.com:5432/[DBNAME]")}
                className="rounded bg-[#f0f5f1] px-2 py-0.5 font-semibold text-[#206642] hover:bg-[#dcefe1]"
              >
                + AWS RDS
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsWorkspaceModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!name.trim() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating &amp; Introspecting...</span>
                </>
              ) : (
                <>
                  <Plus className="size-3.5" />
                  <span>Create Workspace</span>
                </>
              )}
            </Button>
          </div>

        </form>

      </div>
    </div>
  )
}
