'use client'

import React, { createContext, useContext, useState, useEffect } from "react"
import { databaseApi, workspaceApi } from "@/lib/api"
import { useAuth } from "@/lib/authContext"

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
  let userEmail = "default_user"
  let userId = null
  try {
    const authContext = useAuth()
    userEmail = authContext?.user?.email || "default_user"
    userId = authContext?.user?.uid || null
  } catch {
    // Optional / standalone test fallback
  }

  const [workspaces, setWorkspaces] = useState([defaultInitialWorkspace])
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("ws-default")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  // 1. Restore Workspaces on Mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WORKSPACES)
      const storedActiveId = localStorage.getItem(STORAGE_KEY_ACTIVE_WS)

      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setWorkspaces(parsed)
          if (storedActiveId && parsed.some((w) => w.id === storedActiveId)) {
            setActiveWorkspaceId(storedActiveId)
          } else {
            setActiveWorkspaceId(parsed[0].id)
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // 2. Derive Active Workspace
  const activeWorkspace =
    workspaces.find((w) => w.id === activeWorkspaceId) ||
    workspaces[0] ||
    defaultInitialWorkspace

  const connectionUri = activeWorkspace.connectionUri || ""
  const dbInfo = activeWorkspace.dbInfo || null

  // 3. Helper to Persist & Cloud Sync Workspaces
  const persistWorkspaces = (newWorkspaces, newActiveId = activeWorkspaceId) => {
    setWorkspaces(newWorkspaces)
    if (newActiveId) setActiveWorkspaceId(newActiveId)
    try {
      localStorage.setItem(STORAGE_KEY_WORKSPACES, JSON.stringify(newWorkspaces))
      if (newActiveId) localStorage.setItem(STORAGE_KEY_ACTIVE_WS, newActiveId)
    } catch (e) {}

    // Synchronize to backend user account for MCP and Multi-Tenant routing
    workspaceApi.sync({
      email: userEmail,
      user_id: userId,
      workspaces: newWorkspaces.map((w) => ({
        ...w,
        is_active: w.id === (newActiveId || activeWorkspaceId),
      })),
    }).catch(() => {})
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
        introspectedInfo = await databaseApi.connect(connectionUri)
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
      const data = await databaseApi.connect(uri)

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
    return await databaseApi.execute({
      connection_uri: connectionUri,
      sql_query: sqlQuery,
      limit: limit,
    })
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
        isHydrated,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  )
}

export function useDatabase() {
  return useContext(DatabaseContext)
}
