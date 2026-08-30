"use client"

import React, { useState, useRef, useEffect, createContext, useContext } from "react"

const DropdownContext = createContext({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false)
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({ children, asChild = false, className = "" }) {
  const { open, setOpen } = useContext(DropdownContext)

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        children.props.onClick?.(e)
        setOpen(!open)
      },
      "aria-expanded": open,
      "aria-haspopup": "menu",
    })
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
      className={className}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({ children, align = "right", className = "" }) {
  const { open } = useContext(DropdownContext)
  if (!open) return null

  const alignClass = align === "left" ? "left-0" : "right-0"

  return (
    <div
      role="menu"
      className={`absolute ${alignClass} z-50 mt-1.5 min-w-[180px] rounded-xl border border-border bg-popover p-1 shadow-lg text-popover-foreground animate-in fade-in zoom-in-95 duration-100 ${className}`}
    >
      {children}
    </div>
  )
}

export function DropdownMenuItem({ children, onClick, disabled = false, className = "" }) {
  const { setOpen } = useContext(DropdownContext)

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        if (disabled) return
        onClick?.(e)
        setOpen(false)
      }}
      className={`flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className = "" }) {
  return <div className={`-mx-1 my-1 h-px bg-border ${className}`} />
}

export function DropdownMenuLabel({ children, className = "" }) {
  return (
    <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${className}`}>
      {children}
    </div>
  )
}
