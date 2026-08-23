'use client'

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const DatabaseContext = createContext({
  connectionUri: "",
  dbInfo: null,
  isConnecting: false,
  connectionError: "",
  connectToDatabase: async () => {},
  disconnectDatabase: () => {},
  isModalOpen: false,
  setIsModalOpen: () => {},
  executeLiveQuery: async () => {},
})

const STORAGE_KEY_URI = "tts_cloud_postgres_uri"
const STORAGE_KEY_INFO = "tts_cloud_postgres_info"

export function DatabaseProvider({ children }) {
  const [connectionUri, setConnectionUri] = useState("")
  const [dbInfo, setDbInfo] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Restore saved connection from localStorage
  useEffect(() => {
    try {
      const savedUri = localStorage.getItem(STORAGE_KEY_URI)
      const savedInfo = localStorage.getItem(STORAGE_KEY_INFO)
      if (savedUri) setConnectionUri(savedUri)
      if (savedInfo) setDbInfo(JSON.parse(savedInfo))
    } catch (e) {
      // ignore storage errors
    }
  }, [])

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
      setConnectionUri(uri.trim())
      setDbInfo(data)

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY_URI, uri.trim())
        localStorage.setItem(STORAGE_KEY_INFO, JSON.stringify(data))
      } catch (e) {}

      setIsModalOpen(false)
      return true
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Failed to connect to cloud database."
      setConnectionError(msg)
      return false
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectDatabase = () => {
    setConnectionUri("")
    setDbInfo(null)
    setConnectionError("")
    try {
      localStorage.removeItem(STORAGE_KEY_URI)
      localStorage.removeItem(STORAGE_KEY_INFO)
    } catch (e) {}
  }

  const executeLiveQuery = async (sqlQuery, limit = 50) => {
    if (!connectionUri) {
      throw new Error("No database currently connected.")
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
        connectionUri,
        dbInfo,
        isConnecting,
        connectionError,
        connectToDatabase,
        disconnectDatabase,
        isModalOpen,
        setIsModalOpen,
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
