"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import {
  auth,
  isFirebaseConfigured,
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

  // Real-time Firebase Authentication state listener with Local Preview fallback
  useEffect(() => {
    let unsubscribe = () => {}

    if (auth && isFirebaseConfigured) {
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
      } catch {
        setLoading(false)
      }
    } else {
      // Local preview mode: restore saved session if present
      try {
        const saved = localStorage.getItem("tts_user_session")
        if (saved) {
          setUser(JSON.parse(saved))
        }
      } catch {}
      setLoading(false)
    }

    return () => unsubscribe()
  }, [])

  // Sign In with Email & Password
  const loginWithEmail = async (email, password) => {
    setAuthError("")
    if (isFirebaseConfigured && auth) {
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
    } else {
      // Local development preview session
      const previewUser = {
        uid: `usr_${Date.now()}`,
        email: email.trim() || "developer@querycraft.dev",
        displayName: email.includes("@") ? email.split("@")[0] : "QueryCraft User",
        photoURL: null,
        isDemo: true,
      }
      setUser(previewUser)
      try {
        localStorage.setItem("tts_user_session", JSON.stringify(previewUser))
      } catch {}
      return previewUser
    }
  }

  // Sign Up with Email, Password & Display Name
  const registerWithEmail = async (email, password, displayName) => {
    setAuthError("")
    if (isFirebaseConfigured && auth) {
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
    } else {
      // Local development preview session
      const previewUser = {
        uid: `usr_${Date.now()}`,
        email: email.trim() || "alex@querycraft.dev",
        displayName: displayName?.trim() || (email.includes("@") ? email.split("@")[0] : "Alex Rivera"),
        photoURL: null,
        isDemo: true,
      }
      setUser(previewUser)
      try {
        localStorage.setItem("tts_user_session", JSON.stringify(previewUser))
      } catch {}
      return previewUser
    }
  }

  // Sign In with Google OAuth Popup
  const loginWithGoogle = async () => {
    setAuthError("")
    if (isFirebaseConfigured && auth) {
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
    } else {
      // Local development preview session
      const previewUser = {
        uid: `google_${Date.now()}`,
        email: "alex.developer@gmail.com",
        displayName: "Alex Rivera (Google)",
        photoURL: null,
        isDemo: true,
      }
      setUser(previewUser)
      try {
        localStorage.setItem("tts_user_session", JSON.stringify(previewUser))
      } catch {}
      return previewUser
    }
  }

  // Sign In with GitHub OAuth Popup
  const loginWithGithub = async () => {
    setAuthError("")
    if (isFirebaseConfigured && auth) {
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
    } else {
      // Local development preview session
      const previewUser = {
        uid: `github_${Date.now()}`,
        email: "octocat@github.com",
        displayName: "Octocat (GitHub)",
        photoURL: null,
        isDemo: true,
      }
      setUser(previewUser)
      try {
        localStorage.setItem("tts_user_session", JSON.stringify(previewUser))
      } catch {}
      return previewUser
    }
  }

  // Sign Out
  const logout = async () => {
    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth)
      } catch {}
    }
    setUser(null)
    try {
      localStorage.removeItem("tts_user_session")
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isFirebaseConfigured,
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
    str.includes("auth/auth-domain-config-required") ||
    str.includes("auth/invalid-auth-domain")
  ) {
    return "Firebase Auth Domain is missing. Set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN in frontend/.env.local (e.g. your-project.firebaseapp.com) and restart Next.js dev server."
  }
  if (
    str.includes("auth/invalid-api-key") ||
    str.includes("auth/api-key-not-valid")
  ) {
    return "Invalid Firebase API Key. Please verify NEXT_PUBLIC_FIREBASE_API_KEY in frontend/.env.local."
  }
  if (str.includes("auth/operation-not-allowed")) {
    return "This sign-in provider is disabled in Firebase. Enable it in Firebase Console > Authentication > Sign-in method."
  }
  if (str.includes("auth/unauthorized-domain")) {
    return "This domain is not authorized. Add 'localhost' in Firebase Console > Authentication > Settings > Authorized domains."
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
    return "Sign-in popup was blocked by browser. Please allow popups for localhost."
  }
  return (
    str
      .replace("Firebase: ", "")
      .replace(/\(auth\/.*\)\.?/, "")
      .trim() || "Authentication failed."
  )
}
