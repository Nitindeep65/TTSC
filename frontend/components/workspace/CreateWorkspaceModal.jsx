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
  X,
} from "lucide-react"
import { useDatabase } from "@/lib/databaseContext"
import { Button } from "@/components/ui/button"

const envOptions = [
  { label: "Production", color: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
  { label: "Staging", color: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  { label: "Development", color: "bg-sky-500", text: "text-sky-700 dark:text-sky-400" },
  { label: "Analytics", color: "bg-purple-500", text: "text-purple-700 dark:text-purple-400" },
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
        connection_uri: connectionUri.trim() || undefined,
      })
      setName("")
      setConnectionUri("")
      setIsWorkspaceModalOpen(false)
    } catch {
      alert("Failed to create workspace. Please check your inputs.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const applyPreset = (prefix) => {
    setConnectionUri(prefix)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92dvh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-4 sm:p-5 shrink-0 bg-muted/30">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <FolderPlus className="size-4.5 sm:size-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">Create New Workspace</h2>
              <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                Isolate schemas, queries, and databases per project
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="iconSm"
            onClick={() => setIsWorkspaceModalOpen(false)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Workspace Name */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Workspace / Project Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Fintech RDS, Analytics Staging, SaaS Production"
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>

          {/* Environment Tag */}
          <div>
            <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
              Environment Type
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {envOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setEnvironment(opt.label)}
                  className={`flex items-center gap-1.5 rounded-xl border p-2 text-xs font-semibold transition-all cursor-pointer ${
                    environment === opt.label
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 shadow-2xs font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
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
              <label className="block text-xs font-bold text-foreground uppercase tracking-wider">
                Cloud Database URI (Optional)
              </label>
              <span className="text-[10px] text-muted-foreground">Can connect later</span>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={connectionUri}
                onChange={(e) => setConnectionUri(e.target.value)}
                placeholder="postgresql://user:password@host:5432/dbname"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2 pr-10 font-mono text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>

            {/* Presets */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
              <span className="text-muted-foreground font-medium">Quick presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres")}
                className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                + Supabase
              </button>
              <button
                type="button"
                onClick={() => applyPreset("postgresql://[USER]:[PASSWORD]@ep-[ID].region.aws.neon.tech/neondb?sslmode=require")}
                className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
              >
                + Neon
              </button>
              <button
                type="button"
                onClick={() => applyPreset("postgresql://[USER]:[PASSWORD]@[ENDPOINT].rds.amazonaws.com:5432/[DBNAME]")}
                className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-semibold text-foreground hover:bg-muted cursor-pointer transition-colors"
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
              className="border-border hover:bg-muted"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={!name.trim() || isSubmitting}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
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
