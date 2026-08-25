'use client'

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const defaultInitialWorkspace = {
  id: "ws-default",
  name: "E-Commerce Main",
  environment: "Production",
  color: "#3aa363",
  connectionUri: "",
  dbInfo: null,
  createdAt: new Date().toISOString(),
}

const DatabaseContext = createContext({
  workspaces: [defaultInitialWorkspace],
  activeWorkspaceId: "ws-default",
  activeWorkspace: defaultInitialWorkspace,
  setActiveWorkspaceId: () => {},
  createWorkspace: async () => {},
  updateWorkspace: () => {},
  deleteWorkspace: () => {},
  connectionUri: "",
  dbInfo: null,
  isConnecting: false,
  connectionError: "",
  connectToDatabase: async () => {},
  disconnectDatabase: () => {},
  isModalOpen: false,
  setIsModalOpen: () => {},
  isWorkspaceModalOpen: false,
  setIsWorkspaceModalOpen: () => {},
  executeLiveQuery: async () => {},
})

const STORAGE_KEY_WORKSPACES = "tts_cloud_workspaces_v2"
const STORAGE_KEY_ACTIVE_WS = "tts_active_workspace_id_v2"

export function DatabaseProvider({ children }) {
  const [workspaces, setWorkspaces] = useState(() => {
    if (typeof window === "undefined") return [defaultInitialWorkspace]
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKSPACES)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {
      // ignore
    }
    return [defaultInitialWorkspace]
  })

  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window === "undefined") return "ws-default"
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_WS)
      if (savedId) return savedId
    } catch {
      // ignore
    }
    return "ws-default"
  })

  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)

  // 2. Derive Active Workspace
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ||
    workspaces[0] ||
    defaultInitialWorkspace

  const connectionUri = activeWorkspace.connectionUri || ""
  const dbInfo = activeWorkspace.dbInfo || null

  // 3. Helper to Persist Workspaces
  const persistWorkspaces = (newWorkspaces, newActiveId = activeWorkspaceId) => {
    setWorkspaces(newWorkspaces)
    if (newActiveId) setActiveWorkspaceId(newActiveId)
    try {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(newWorkspaces))
      if (newActiveId) localStorage.setItem(STORAGE_KEY_ACTIVE_WS, newActiveId)
    } catch (e) {}
  }

  // 4. Create New Workspace
  const createWorkspace = async ({
    name,
    environment = "Production",
    connectionUri = "",
    color = "#3aa363",
  }) => {
    const newId = `ws-${Date.now()}`
    let introspectedInfo = null

    // If connectionUri is provided, test and introspect it
    if (connectionUri && connectionUri.trim()) {
      try {
        const res = await axios.post("http://127.0.0.1:8000/api/database/connect", {
          connection_uri: connectionUri.trim(),
        })
        introspectedInfo = res.data
      } catch (err) {
        // failed introspection - still create workspace but keep error
      }
    }

    const newWs = {
      id: newId,
      name: name || `Project ${workspaces.length + 1}`,
      environment,
      color,
      connectionUri: connectionUri.trim(),
      dbInfo: introspectedInfo,
      createdAt: new Date().toISOString(),
    }

    const updated = [...workspaces, newWs]
    persistWorkspaces(updated, newId)
    setIsWorkspaceModalOpen(false)
    return newWs
  }

  // 5. Update Existing Workspace
  const updateWorkspace = (id, updates) => {
    const updated = workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w))
    persistWorkspaces(updated)
  }

  // 6. Delete Workspace
  const deleteWorkspace = (id) => {
    if (workspaces.length <= 1) {
      alert("You must keep at least one active workspace.")
      return
    }
    const filtered = workspaces.filter((w) => w.id !== id)
    const nextActiveId = id === activeWorkspaceId ? filtered[0].id : activeWorkspaceId
    persistWorkspaces(filtered, nextActiveId)
  }

  // 7. Connect Database to Active Workspace
  const connectToDatabase = async (uri) => {
    if (!uri || !uri.trim()) {
      setConnectionError("Please provide a valid PostgreSQL connection string.")
      return false
    }

    setIsConnecting(true)
    setConnectionError("")

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/database/connect", {
        connection_uri: uri.trim(),
      })

      const data = res.data

      // Update in active workspace
      const updated = workspaces.map((w) =>
        w.id === activeWorkspaceId
          ? { ...w, connectionUri: uri.trim(), dbInfo: data }
          : w
      )
      persistWorkspaces(updated)

      setIsModalOpen(false)
      return true
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Failed to connect to cloud database."
      setConnectionError(msg)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  // 8. Disconnect Database from Active Workspace
  const disconnectDatabase = () => {
    setConnectionError("")
    const updated = workspaces.map((w) =>
      w.id === activeWorkspaceId
        ? { ...w, connectionUri: "", dbInfo: null }
        : w
    )
    persistWorkspaces(updated)
  }

  // 9. Execute Live Query in Active Workspace
  const executeLiveQuery = async (sqlQuery, limit = 50) => {
    if (!connectionUri) {
      throw new Error("No database currently connected to this workspace.")
    }
    const res = await axios.post("http://127.0.0.1:8000/api/database/execute", {
      connection_uri: connectionUri,
      sql_query: sqlQuery,
      limit: limit,
    })
    return res.data
  }

  return (
    <DatabaseContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        setActiveWorkspaceId: (id) => {
          setActiveWorkspaceId(id)
          try {
            localStorage.setItem(STORAGE_KEY_ACTIVE_WS, id)
          } catch (e) {}
        },
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        connectionUri,
        dbInfo,
        isConnecting,
        connectionError,
        connectToDatabase,
        disconnectDatabase,
        isModalOpen,
        setIsModalOpen,
        isWorkspaceModalOpen,
        setIsWorkspaceModalOpen,
        executeLiveQuery,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  return useContext(DatabaseContext)
}
