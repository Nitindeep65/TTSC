"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  auth,
  apiKey,
  googleProvider,
  githubProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "./firebase"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState("")

  // Real-time Firebase Authentication listener
  useEffect(() => {
    let unsubscribe = () => {}

    if (auth && apiKey && apiKey !== "AIzaSyDummyBuildPlaceholderOnly") {
      try {
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (firebaseUser) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "QueryCraft User",
              photoURL: firebaseUser.photoURL || null,
            })
          } else {
            setUser(null)
          }
          setLoading(false)
        })
      } catch (err) {
        console.error("Firebase auth state error:", err)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }

    return () => unsubscribe()
  }, [])

  // Helper check for missing env vars in build
  const checkFirebaseEnv = () => {
    if (process.env.NODE_ENV === "test") return
    if (!apiKey || apiKey === "AIzaSyDummyBuildPlaceholderOnly") {
      throw new Error(
        "Firebase API Key not compiled into build: After adding environment variables in Vercel, you MUST go to Vercel > Deployments > ... > Redeploy for Next.js to embed them."
      )
    }
  }

  // Sign In with Email & Password (Realtime Firebase)
  const loginWithEmail = async (email, password) => {
    setAuthError("")
    checkFirebaseEnv()
    if (!auth) throw new Error("Firebase Auth is not initialized.")

    try {
      const res = await signInWithEmailAndPassword(auth, email.trim(), password)
      const loggedUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName:
          res.user.displayName || res.user.email?.split("@")[0] || "QueryCraft User",
        photoURL: res.user.photoURL || null,
      }
      setUser(loggedUser)
      return loggedUser
    } catch (err) {
      const msg = formatFirebaseError(err.code || err.message)
      setAuthError(msg)
      throw new Error(msg)
    }
  }

  // Sign Up with Email & Password (Realtime Firebase)
  const registerWithEmail = async (email, password, displayName) => {
    setAuthError("")
    checkFirebaseEnv()
    if (!auth) throw new Error("Firebase Auth is not initialized.")

    try {
      const res = await createUserWithEmailAndPassword(auth, email.trim(), password)
      if (displayName && res.user) {
        await updateProfile(res.user, { displayName: displayName.trim() })
      }
      const newUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName:
          displayName?.trim() || res.user.email?.split("@")[0] || "QueryCraft User",
        photoURL: res.user.photoURL || null,
      }
      setUser(newUser)
      return newUser
    } catch (err) {
      const msg = formatFirebaseError(err.code || err.message)
      setAuthError(msg)
      throw new Error(msg)
    }
  }

  // Sign In with Google (Realtime Firebase Popup)
  const loginWithGoogle = async () => {
    setAuthError("")
    checkFirebaseEnv()
    if (!auth) throw new Error("Firebase Auth is not initialized.")

    try {
      const res = await signInWithPopup(auth, googleProvider)
      const loggedUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || "Google User",
        photoURL: res.user.photoURL || null,
      }
      setUser(loggedUser)
      return loggedUser
    } catch (err) {
      const msg = formatFirebaseError(err.code || err.message)
      setAuthError(msg)
      throw new Error(msg)
    }
  }

  // Sign In with GitHub (Realtime Firebase Popup)
  const loginWithGithub = async () => {
    setAuthError("")
    checkFirebaseEnv()
    if (!auth) throw new Error("Firebase Auth is not initialized.")

    try {
      const res = await signInWithPopup(auth, githubProvider)
      const loggedUser = {
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || "GitHub User",
        photoURL: res.user.photoURL || null,
      }
      setUser(loggedUser)
      return loggedUser
    } catch (err) {
      const msg = formatFirebaseError(err.code || err.message)
      setAuthError(msg)
      throw new Error(msg)
    }
  }

  // Sign Out (Realtime Firebase)
  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth)
      } catch (err) {
        console.error("Firebase signout error:", err)
      }
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithGithub,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

function formatFirebaseError(codeOrMessage) {
  if (!codeOrMessage) return "Authentication failed."
  const str = String(codeOrMessage)

  if (
    str.includes("auth/invalid-api-key") ||
    str.includes("auth/api-key-not-valid")
  ) {
    return "Invalid Firebase API Key. Please verify: 1) You redeployed after setting variables in Vercel. 2) The key starts with 'AIzaSy' and has no extra spaces or quotes. 3) Identity Toolkit API is enabled in Google Cloud Console."
  }
  if (
    str.includes("auth/auth-domain-config-required") ||
    str.includes("auth/invalid-auth-domain")
  ) {
    return "Firebase Auth Domain is missing. Set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in Vercel Project Settings > Environment Variables, then Redeploy."
  }
  if (str.includes("auth/operation-not-allowed")) {
    return "This sign-in provider is disabled in Firebase. Enable Google / Email in Firebase Console > Authentication > Sign-in method."
  }
  if (str.includes("auth/unauthorized-domain")) {
    return "This domain is not authorized in Firebase. Add your Vercel URL (e.g. *.vercel.app) in Firebase Console > Authentication > Settings > Authorized domains."
  }
  if (
    str.includes("auth/invalid-credential") ||
    str.includes("auth/wrong-password")
  ) {
    return "Invalid email or password. Please check your credentials."
  }
  if (str.includes("auth/user-not-found")) {
    return "No account found with this email. Please sign up first."
  }
  if (str.includes("auth/email-already-in-use")) {
    return "This email is already registered. Please sign in instead."
  }
  if (str.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters."
  }
  if (str.includes("auth/popup-closed-by-user")) {
    return "Sign-in popup was closed before completing."
  }
  if (str.includes("auth/popup-blocked")) {
    return "Sign-in popup was blocked by browser. Please allow popups for this site."
  }
  return (
    str
      .replace("Firebase: ", "")
      .replace(/\(auth\/.*\)\.?/, "")
      .trim() || "Authentication failed."
  )
}
