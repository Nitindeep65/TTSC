"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useId } from "react"
import { Search, X } from "lucide-react"

const CommandContext = createContext({
  search: "",
  setSearch: () => {},
  activeIndex: 0,
  setActiveIndex: () => {},
  registerItem: () => {},
  unregisterItem: () => {},
  itemCount: 0,
})

function fuzzyScore(text, query) {
  if (!query) return 1
  if (!text) return 0
  const t = text.toLowerCase()
  const q = query.toLowerCase().trim()
  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 50
  
  // Fuzzy character sequence scoring
  let qIdx = 0
  let score = 0
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) {
      qIdx++
      score += 10
    }
  }
  return qIdx === q.length ? score : 0
}

export function Command({ children, className = "", onKeyDown }) {
  const [search, setSearch] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const itemsRef = useRef([])

  const registerItem = (id, selectFn, text) => {
    itemsRef.current.push({ id, selectFn, text })
  }

  const unregisterItem = (id) => {
    itemsRef.current = itemsRef.current.filter((item) => item.id !== id)
  }

  const handleKeyDown = (e) => {
    const visibleItems = itemsRef.current.filter(
      (item) => !search || fuzzyScore(item.text, search) > 0
    )

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev + 1) % Math.max(1, visibleItems.length))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev - 1 + visibleItems.length) % Math.max(1, visibleItems.length))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (visibleItems[activeIndex]?.selectFn) {
        visibleItems[activeIndex].selectFn()
      }
    }

    if (onKeyDown) onKeyDown(e)
  }

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch,
        activeIndex,
        setActiveIndex,
        registerItem,
        unregisterItem,
        itemCount: itemsRef.current.length,
      }}
    >
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-xl bg-card text-card-foreground shadow-2xl border border-border ${className}`}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </CommandContext.Provider>
  )
}

export function CommandDialog({ open, onOpenChange, children }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => onOpenChange(false)}
      />
      {/* Modal Container */}
      <div className="relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-150 z-50">
        {children}
      </div>
    </div>
  )
}

export function CommandInput({ placeholder = "Type a command or search...", value, onValueChange, className = "" }) {
  const { search, setSearch, setActiveIndex } = useContext(CommandContext)
  const currentVal = value !== undefined ? value : search

  const handleChange = (e) => {
    const newVal = e.target.value
    if (onValueChange) onValueChange(newVal)
    setSearch(newVal)
    setActiveIndex(0)
  }

  return (
    <div className={`flex items-center border-b border-border px-3.5 py-2.5 ${className}`}>
      <Search className="size-4 shrink-0 text-muted-foreground mr-2.5" />
      <input
        type="text"
        value={currentVal}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus
        className="flex h-6 w-full rounded-md bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-normal"
      />
      {currentVal && (
        <button
          type="button"
          onClick={() => {
            if (onValueChange) onValueChange("")
            setSearch("")
            setActiveIndex(0)
          }}
          className="p-1 text-muted-foreground hover:text-foreground rounded"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

export function CommandList({ children, className = "" }) {
  return (
    <div className={`max-h-80 overflow-y-auto overflow-x-hidden p-1.5 space-y-1 ${className}`}>
      {children}
    </div>
  )
}

export function CommandEmpty({ children = "No results found." }) {
  return (
    <div className="py-6 text-center text-xs text-muted-foreground font-normal">
      {children}
    </div>
  )
}

export function CommandGroup({ heading, children, className = "" }) {
  return (
    <div className={`py-1 ${className}`}>
      {heading && (
        <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {heading}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}

export function CommandItem({ children, onSelect, className = "", text = "" }) {
  const { search, activeIndex } = useContext(CommandContext)
  const id = useId()
  const itemRef = useRef(null)

  // Extract raw string representation for search
  const textContent = text || (typeof children === "string" ? children : itemRef.current?.innerText || "")
  const isMatch = !search || fuzzyScore(textContent, search) > 0

  if (!isMatch) return null

  return (
    <div
      ref={itemRef}
      onClick={onSelect}
      className={`relative flex cursor-pointer select-none items-center justify-between rounded-lg px-2.5 py-2 text-xs text-foreground outline-none transition-colors duration-100 hover:bg-accent hover:text-accent-foreground font-normal ${className}`}
    >
      {children}
    </div>
  )
}

export function CommandShortcut({ children, className = "" }) {
  return (
    <span className={`ml-auto text-[10px] font-mono tracking-widest text-muted-foreground ${className}`}>
      {children}
    </span>
  )
}
