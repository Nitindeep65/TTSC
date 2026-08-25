import { initializeApp, getApps, getApp } from "firebase/app"
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth"

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || ""
const authDomain =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
  (projectId ? `${projectId}.firebaseapp.com` : "")
const storageBucket =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
  (projectId ? `${projectId}.appspot.com` : "")
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || ""
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""

/**
 * Flag indicating whether production Firebase credentials are provided in .env.local
 */
export const isFirebaseConfigured = Boolean(
  apiKey &&
  apiKey.startsWith("AIza") &&
  apiKey !== "AIzaSyDummyKeyForBuildEnvironment" &&
  !apiKey.includes("Demo") &&
  !apiKey.includes("Placeholder") &&
  (authDomain || projectId)
)

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDummyKeyForBuildEnvironment",
  authDomain: authDomain || "localhost",
  projectId: projectId || "querycraft-app",
  storageBucket: storageBucket,
  messagingSenderId: messagingSenderId,
  appId: appId,
}

// Safely initialize Firebase singleton
let app = null
let auth = null

try {
  if (getApps().length > 0) {
    app = getApp()
  } else {
    app = initializeApp(firebaseConfig)
  }
  auth = getAuth(app)
} catch {
  app = null
  auth = null
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export const githubProvider = new GithubAuthProvider()

export {
  app,
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
}

const firebaseClient = {
  app,
  auth,
  isFirebaseConfigured,
  googleProvider,
  githubProvider,
}

export default firebaseClient
