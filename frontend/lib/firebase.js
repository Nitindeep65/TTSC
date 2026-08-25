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

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: authDomain,
  projectId: projectId,
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
  } else if (apiKey) {
    app = initializeApp(firebaseConfig)
  } else {
    // Build/Test fallback to allow compilation
    app = initializeApp({
      apiKey: "AIzaSyDummyBuildPlaceholderOnly",
      authDomain: "querycraft.firebaseapp.com",
      projectId: "querycraft-prod",
    })
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
  googleProvider,
  githubProvider,
}

export default firebaseClient
