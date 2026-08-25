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

const cleanEnv = (val) => (val || "").replace(/['"]/g, "").trim()

const apiKey = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY)
const projectId = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
const authDomain =
  cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ||
  (projectId ? `${projectId}.firebaseapp.com` : "")
const storageBucket =
  cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ||
  (projectId ? `${projectId}.appspot.com` : "")
const messagingSenderId = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID)
const appId = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID)

const firebaseConfig = {
  apiKey: apiKey || "AIzaSyDummyBuildPlaceholderOnly",
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
  apiKey,
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
  apiKey,
  googleProvider,
  githubProvider,
}

export default firebaseClient
