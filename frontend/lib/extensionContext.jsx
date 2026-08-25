"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { playExtensionPromptSound, isSoundEnabled, setSoundEnabled } from "@/lib/soundUtils"

const ExtensionContext = createContext(null)

const DISMISSED_UNTIL_KEY = "querycraft_ext_prompt_dismissed_until"
const DISMISSED_FOREVER_KEY = "querycraft_ext_prompt_dismissed_forever"

export function ExtensionProvider({ children }) {
  const [isInstalled, setIsInstalled] = useState(null) // null = unknown, true = installed, false = not installed
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [soundActive, setSoundActive] = useState(true)
  const [isChecking, setIsChecking] = useState(false)

  // Initialize sound preference
  useEffect(() => {
    setSoundActive(isSoundEnabled())
  }, [])

  // Check if extension is installed using DOM attributes & postMessage
  const checkInstallation = useCallback(async () => {
    setIsChecking(true)

    if (typeof window === "undefined") {
      setIsChecking(false)
      return false
    }

    // 1. Direct DOM check (fastest)
    const hasAttr = document.documentElement.hasAttribute("data-querycraft-extension-installed")
    const hasRoot = !!document.getElementById("querycraft-spotlight-root")
    if (hasAttr || hasRoot) {
      setIsInstalled(true)
      setIsChecking(false)
      return true
    }

    // 2. PostMessage Ping with 800ms timeout
    return new Promise((resolve) => {
      let resolved = false

      const handlePong = (event) => {
        if (event.data && (event.data.type === "QUERYCRAFT_PONG" || event.data.type === "QUERYCRAFT_EXTENSION_LOADED")) {
          resolved = true
          window.removeEventListener("message", handlePong)
          setIsInstalled(true)
          setIsChecking(false)
          resolve(true)
        }
      }

      window.addEventListener("message", handlePong)

      // Send Ping
      try {
        window.postMessage({ type: "QUERYCRAFT_PING" }, "*")
      } catch (e) {}

      // Fallback check on timeout
      setTimeout(() => {
        if (!resolved) {
          window.removeEventListener("message", handlePong)
          // Re-verify DOM one last time in case content script injected asynchronously
          const finalCheck = document.documentElement.hasAttribute("data-querycraft-extension-installed") ||
                             !!document.getElementById("querycraft-spotlight-root")
          setIsInstalled(finalCheck)
          setIsChecking(false)
          resolve(finalCheck)
        }
      }, 800)
    })
  }, [])

  // Initial detection & automated prompt trigger on Dashboard load
  useEffect(() => {
    let timer = null

    async function evaluatePrompt() {
      // Direct trigger via URL query param (?showExtension=true)
      if (typeof window !== "undefined") {
        try {
          const params = new URLSearchParams(window.location.search)
          if (params.get("showExtension") === "true") {
            setIsModalOpen(true)
            playExtensionPromptSound()
            return
          }
        } catch (e) {}
      }

      // Check snooze / dismissal settings
      const dismissedForever = localStorage.getItem(DISMISSED_FOREVER_KEY) === "true"
      const dismissedUntil = Number(localStorage.getItem(DISMISSED_UNTIL_KEY) || 0)
      const isSnoozed = Date.now() < dismissedUntil

      const installed = await checkInstallation()

      if (!installed && !dismissedForever && !isSnoozed) {
        // Wait 1.2s so user gets settled on dashboard before presenting popup
        timer = setTimeout(() => {
          setIsModalOpen(true)
          playExtensionPromptSound()
        }, 1200)
      }
    }

    evaluatePrompt()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [checkInstallation])

  // Open modal manually with sound
  const openModal = useCallback((withSound = true) => {
    setIsModalOpen(true)
    if (withSound) {
      playExtensionPromptSound()
    }
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // Dismiss for specified duration in hours (default 24h)
  const dismissModal = useCallback((durationHours = 24) => {
    setIsModalOpen(false)
    const expireTime = Date.now() + durationHours * 3600 * 1000
    localStorage.setItem(DISMISSED_UNTIL_KEY, expireTime.toString())
  }, [])

  // Dismiss permanently
  const dismissForever = useCallback(() => {
    setIsModalOpen(false)
    localStorage.setItem(DISMISSED_FOREVER_KEY, "true")
  }, [])

  const toggleSound = useCallback(() => {
    setSoundActive((prev) => {
      const next = !prev
      setSoundEnabled(next)
      if (next) playExtensionPromptSound()
      return next
    })
  }, [])

  return (
    <ExtensionContext.Provider
      value={{
        isInstalled,
        isModalOpen,
        isChecking,
        soundActive,
        openModal,
        closeModal,
        dismissModal,
        dismissForever,
        checkInstallation,
        toggleSound,
        setIsModalOpen,
      }}
    >
      {children}
    </ExtensionContext.Provider>
  )
}

export function useExtension() {
  const context = useContext(ExtensionContext)
  if (!context) {
    throw new Error("useExtension must be used within an ExtensionProvider")
  }
  return context
}
