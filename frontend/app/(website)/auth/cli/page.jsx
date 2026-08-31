"use client"

import { useState, useEffect, useCallback, Suspense, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Database, Terminal, CheckCircle2, XCircle, Shield, Zap, Lock } from "lucide-react"
import { useAuth } from "@/lib/authContext"

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"

// ─── Animated background particles ───────────────────────────────────────────
function Particles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    let animId
    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.15,
    }))

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.dx
        p.y += p.dy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(52, 211, 153, ${p.alpha})`
        ctx.fill()
      })
      // Draw faint connection lines
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 90) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(52, 211, 153, ${0.06 * (1 - d / 90)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
}

// ─── Typing animation for terminal status bar ─────────────────────────────────
function TypingText({ text, speed = 38 }) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    setDisplayed("")
    let i = 0
    const t = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1))
        i++
      } else clearInterval(t)
    }, speed)
    return () => clearInterval(t)
  }, [text, speed])
  return (
    <span>
      {displayed}
      <span style={{ animation: "blink 1s step-end infinite", opacity: 1 }}>▌</span>
    </span>
  )
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ icon: Icon, label }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
      background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.18)",
      borderRadius: 10, fontSize: 12, color: "#6ee7b7", fontWeight: 500,
    }}>
      <Icon size={13} style={{ color: "#34d399" }} />
      {label}
    </div>
  )
}

// ─── Google SVG ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

// ─── GitHub SVG ───────────────────────────────────────────────────────────────
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12" />
  </svg>
)

// ─── Main inner component ─────────────────────────────────────────────────────
function CLIAuthInner() {
  const searchParams = useSearchParams()
  const { loginWithEmail, loginWithGoogle, loginWithGithub, user } = useAuth()

  const state = searchParams.get("state") || ""
  const callbackUrl = searchParams.get("callback") || ""

  const [step, setStep] = useState("login") // login | exchanging | success | error
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState(null) // "google" | "github"
  const [successEmail, setSuccessEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // ── Token exchange ──────────────────────────────────────────────────────────
  const exchangeTokenAndRedirect = useCallback(async (email) => {
    setStep("exchanging")
    try {
      const res = await fetch(`${BACKEND}/api/auth/cli-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, state: state || undefined }),
      })
      if (!res.ok) throw new Error(await res.text())
      const { cli_token } = await res.json()
      setSuccessEmail(email)
      setStep("success")
      if (callbackUrl) {
        const params = new URLSearchParams({ token: cli_token, email })
        setTimeout(() => { window.location.href = `${callbackUrl}?${params.toString()}` }, 2000)
      }
    } catch (err) {
      setError(err.message || "Token exchange failed. Please try again.")
      setStep("error")
    }
  }, [state, callbackUrl])

  // If already logged in via Firebase, auto-proceed
  useEffect(() => {
    if (user?.email && step === "login") {
      exchangeTokenAndRedirect(user.email)
    }
  }, [user, step, exchangeTokenAndRedirect])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError("")
    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.")
      return
    }
    setIsLoading(true)
    try {
      await loginWithEmail(formData.email, formData.password)
      await exchangeTokenAndRedirect(formData.email)
    } catch (err) {
      setError(err.message || "Sign-in failed. Check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError("")
    setSocialLoading("google")
    try {
      const result = await loginWithGoogle()
      const email = result?.user?.email || user?.email
      if (email) await exchangeTokenAndRedirect(email)
    } catch (err) {
      setError(err.message || "Google sign-in failed.")
    } finally {
      setSocialLoading(null)
    }
  }

  const handleGithub = async () => {
    setError("")
    setSocialLoading("github")
    try {
      const result = await loginWithGithub()
      const email = result?.user?.email || user?.email
      if (email) await exchangeTokenAndRedirect(email)
    } catch (err) {
      setError(err.message || "GitHub sign-in failed.")
    } finally {
      setSocialLoading(null)
    }
  }

  const statusText = step === "success"
    ? `Authenticated as ${successEmail} · Redirecting to terminal...`
    : step === "exchanging"
    ? "Authorizing CLI session · Generating secure token..."
    : "querycraft auth login · Awaiting authentication"

  const busy = isLoading || !!socialLoading

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.4} 70%{transform:scale(1.6);opacity:0} 100%{transform:scale(1);opacity:0} }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes success-pop { 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", fontFamily:"Inter, sans-serif", background:"#070e0a", color:"#e2e8f0" }}>

        {/* ── Left Panel ─────────────────────────────────────────── */}
        <div style={{
          position:"relative", width:"45%", display:"none", flexDirection:"column",
          alignItems:"center", justifyContent:"center", padding:"48px",
          background:"linear-gradient(160deg, #070e0a 0%, #0a1f12 50%, #071209 100%)",
          borderRight:"1px solid rgba(52,211,153,0.1)", overflow:"hidden",
          "@media(min-width:1024px)":{display:"flex"},
        }} className="cli-left-panel">
          {/* Ambient blobs */}
          <div style={{ position:"absolute", top:"-15%", left:"-15%", width:450, height:450, borderRadius:"50%", background:"radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
          <div style={{ position:"absolute", bottom:"-15%", right:"-15%", width:350, height:350, borderRadius:"50%", background:"radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents:"none" }} />
          <Particles />

          {/* Content */}
          <div style={{ position:"relative", zIndex:10, textAlign:"center", maxWidth:380, animation:"fadeUp 0.7s ease both" }}>
            {/* Logo */}
            <div style={{
              width:80, height:80, borderRadius:22, margin:"0 auto 28px",
              background:"linear-gradient(135deg, #065f46 0%, #064e3b 100%)",
              border:"1px solid rgba(52,211,153,0.3)",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 40px rgba(52,211,153,0.2), 0 8px 24px rgba(0,0,0,0.4)",
              animation:"float 4s ease-in-out infinite",
            }}>
              <Database size={36} color="#34d399" />
            </div>

            <h1 style={{ fontSize:36, fontWeight:800, color:"#fff", letterSpacing:"-1px", marginBottom:10, lineHeight:1.1 }}>
              Query<span style={{ color:"#34d399" }}>Craft</span>
            </h1>
            <p style={{ color:"#6ee7b7", fontSize:14, fontWeight:500, marginBottom:36, opacity:0.8 }}>
              AI-Powered SQL &amp; NoSQL Engine
            </p>

            {/* Feature pills */}
            <div style={{ display:"flex", flexDirection:"column", gap:10, alignItems:"center" }}>
              <FeaturePill icon={Shield} label="Zero-hallucination schema grounding" />
              <FeaturePill icon={Zap} label="Self-healing critic & cost guard loop" />
              <FeaturePill icon={Lock} label="Read-only execution · Secure by design" />
            </div>

            {/* Terminal preview */}
            <div style={{
              marginTop:36, background:"rgba(0,0,0,0.6)", border:"1px solid rgba(52,211,153,0.15)",
              borderRadius:14, padding:"16px 20px", textAlign:"left",
              fontFamily:"'JetBrains Mono', monospace", fontSize:12,
              boxShadow:"0 20px 40px rgba(0,0,0,0.3)",
            }}>
              <div style={{ display:"flex", gap:6, marginBottom:12 }}>
                {["#ff5f57","#ffbd2e","#28c840"].map((c,i) => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:c }} />)}
              </div>
              <div style={{ color:"#6b7280", lineHeight:1.8 }}>
                <div><span style={{ color:"#34d399" }}>$</span> <span style={{ color:"#e2e8f0" }}>querycraft auth login</span></div>
                <div style={{ color:"#34d399", marginTop:4 }}>✓ Opening browser...</div>
                <div style={{ color:"#a3e635" }}>✅ Authenticated as you@company.com</div>
                <div style={{ color:"#64748b" }}>3 workspace(s) loaded</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────── */}
        <div style={{
          flex:1, display:"flex", flexDirection:"column",
          background:"linear-gradient(180deg, #0a130e 0%, #07100a 100%)",
        }}>
          {/* Terminal status bar */}
          <div style={{
            padding:"11px 24px",
            background:"rgba(0,0,0,0.5)",
            borderBottom:"1px solid rgba(52,211,153,0.1)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            fontFamily:"'JetBrains Mono', monospace", fontSize:11,
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Terminal size={13} color="#34d399" />
              <span style={{ color: step === "success" ? "#4ade80" : "#34d399" }}>
                <TypingText key={statusText} text={statusText} />
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, color:"#374151" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background: step === "success" ? "#4ade80" : "#34d399", boxShadow:`0 0 8px ${step==="success"?"#4ade80":"#34d399"}` }} />
              <span style={{ color:"#4b5563", fontSize:10 }}>localhost:9876</span>
            </div>
          </div>

          {/* Form area */}
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 24px" }}>
            <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.5s ease both" }}>

              {/* ── LOGIN STEP ── */}
              {(step === "login" || step === "error") && (
                <>
                  {/* Header */}
                  <div style={{ textAlign:"center", marginBottom:32 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:52, height:52, borderRadius:14, background:"linear-gradient(135deg, #064e3b, #065f46)", border:"1px solid rgba(52,211,153,0.3)", marginBottom:18, boxShadow:"0 4px 20px rgba(52,211,153,0.15)" }}>
                      <Database size={24} color="#34d399" />
                    </div>
                    <h1 style={{ fontSize:24, fontWeight:800, color:"#f9fafb", letterSpacing:"-0.5px", marginBottom:6 }}>Welcome back, Developer</h1>
                    <p style={{ color:"#6b7280", fontSize:13, lineHeight:1.6 }}>
                      Sign in to authorize{" "}
                      <code style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:5, padding:"1px 6px", fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"#6ee7b7" }}>
                        querycraft auth login
                      </code>
                    </p>
                  </div>

                  {/* Social buttons */}
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
                    {[
                      { id:"google", label:"Google", icon:<GoogleIcon />, handler:handleGoogle },
                      { id:"github", label:"GitHub", icon:<GitHubIcon />, handler:handleGithub },
                    ].map(({ id, label, icon, handler }) => (
                      <button
                        key={id}
                        id={`cli-${id}-btn`}
                        onClick={handler}
                        disabled={busy}
                        style={{
                          display:"flex", alignItems:"center", justifyContent:"center", gap:9,
                          padding:"11px 14px", borderRadius:10,
                          background:"rgba(255,255,255,0.04)",
                          border:"1px solid rgba(255,255,255,0.09)",
                          color:"#d1d5db", fontSize:13, fontWeight:600,
                          cursor: busy ? "not-allowed" : "pointer",
                          opacity: busy ? 0.5 : 1,
                          transition:"all 0.15s",
                          fontFamily:"Inter, sans-serif",
                        }}
                        onMouseEnter={e => { if (!busy) { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)" }}}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)" }}
                      >
                        {socialLoading === id ? <Loader2 size={15} style={{ animation:"spin 0.7s linear infinite" }} /> : icon}
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }} />
                    <span style={{ color:"#374151", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>or continue with email</span>
                    <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }} />
                  </div>

                  {/* Email form */}
                  <form onSubmit={handleEmailLogin} id="cli-email-form">
                    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                      {/* Email */}
                      <div>
                        <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                          Email
                        </label>
                        <input
                          id="cli-email-input"
                          type="email"
                          placeholder="you@company.com"
                          autoComplete="email"
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          disabled={busy}
                          required
                          style={{
                            width:"100%", padding:"11px 14px", borderRadius:10, fontSize:14,
                            background:"rgba(255,255,255,0.04)", color:"#f9fafb",
                            border:"1px solid rgba(255,255,255,0.09)", outline:"none",
                            fontFamily:"Inter, sans-serif", transition:"all 0.15s",
                          }}
                          onFocus={e => { e.target.style.borderColor = "rgba(52,211,153,0.5)"; e.target.style.background = "rgba(52,211,153,0.04)"; e.target.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.08)" }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none" }}
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:6 }}>
                          Password
                        </label>
                        <div style={{ position:"relative" }}>
                          <input
                            id="cli-password-input"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                            disabled={busy}
                            required
                            style={{
                              width:"100%", padding:"11px 44px 11px 14px", borderRadius:10, fontSize:14,
                              background:"rgba(255,255,255,0.04)", color:"#f9fafb",
                              border:"1px solid rgba(255,255,255,0.09)", outline:"none",
                              fontFamily:"Inter, sans-serif", transition:"all 0.15s",
                            }}
                            onFocus={e => { e.target.style.borderColor = "rgba(52,211,153,0.5)"; e.target.style.background = "rgba(52,211,153,0.04)"; e.target.style.boxShadow = "0 0 0 3px rgba(52,211,153,0.08)" }}
                            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.09)"; e.target.style.background = "rgba(255,255,255,0.04)"; e.target.style.boxShadow = "none" }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#6b7280", cursor:"pointer", padding:2, lineHeight:0 }}
                          >
                            {showPassword ? (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                            ) : (
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Error */}
                      {error && (
                        <div style={{
                          display:"flex", alignItems:"center", gap:8,
                          background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)",
                          borderRadius:10, padding:"10px 12px",
                          color:"#fca5a5", fontSize:13, animation:"fadeUp 0.2s ease",
                        }}>
                          <XCircle size={14} style={{ flexShrink:0 }} />
                          {error}
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        id="cli-submit-btn"
                        disabled={busy}
                        style={{
                          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                          padding:"13px", borderRadius:11, fontSize:14, fontWeight:700,
                          background: busy ? "rgba(5,150,105,0.4)" : "linear-gradient(135deg, #059669, #047857)",
                          border:"1px solid rgba(52,211,153,0.2)",
                          color:"#fff", cursor: busy ? "not-allowed" : "pointer",
                          transition:"all 0.2s", marginTop:4,
                          boxShadow: busy ? "none" : "0 4px 16px rgba(5,150,105,0.35)",
                          fontFamily:"Inter, sans-serif",
                        }}
                        onMouseEnter={e => { if (!busy) { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 8px 24px rgba(5,150,105,0.5)" }}}
                        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 4px 16px rgba(5,150,105,0.35)" }}
                      >
                        {isLoading ? <Loader2 size={16} style={{ animation:"spin 0.7s linear infinite" }} /> : null}
                        {isLoading ? "Signing in..." : "Sign In & Authorize CLI"}
                      </button>
                    </div>
                  </form>

                  {/* Footer note */}
                  <p style={{ textAlign:"center", color:"#374151", fontSize:11, marginTop:24, lineHeight:1.7 }}>
                    This grants <code style={{ background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:4, padding:"1px 5px", fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:"#6ee7b7" }}>querycraft</code>{" "}
                    CLI access to your workspaces &amp; live database connections.{" "}
                    <span style={{ color:"#4b5563" }}>Token is stored securely in <code style={{ fontFamily:"monospace", fontSize:10 }}>~/.querycraft/auth.json</code></span>
                  </p>
                </>
              )}

              {/* ── EXCHANGING STEP ── */}
              {step === "exchanging" && (
                <div style={{ textAlign:"center", padding:"40px 0", animation:"fadeUp 0.3s ease" }}>
                  <div style={{ position:"relative", width:72, height:72, margin:"0 auto 28px" }}>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(52,211,153,0.3)", animation:"pulse-ring 1.5s ease-out infinite" }} />
                    <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Loader2 size={28} color="#34d399" style={{ animation:"spin 0.8s linear infinite" }} />
                    </div>
                  </div>
                  <h2 style={{ fontSize:20, fontWeight:700, color:"#f9fafb", marginBottom:8 }}>Authorizing CLI...</h2>
                  <p style={{ color:"#6b7280", fontSize:13 }}>Generating your secure 30-day session token</p>
                  <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:8 }}>
                    {["Verifying identity","Minting CLI session token","Loading your workspaces"].map((s, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"9px 14px" }}>
                        <Loader2 size={12} color="#34d399" style={{ animation:"spin 0.8s linear infinite", animationDelay:`${i*0.15}s` }} />
                        <span style={{ color:"#6b7280", fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SUCCESS STEP ── */}
              {step === "success" && (
                <div style={{ textAlign:"center", padding:"32px 0", animation:"fadeUp 0.4s ease" }}>
                  <div style={{ position:"relative", width:80, height:80, margin:"0 auto 24px" }}>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"2px solid rgba(74,222,128,0.4)", animation:"pulse-ring 1.5s ease-out infinite" }} />
                    <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(74,222,128,0.1)", border:"1px solid rgba(74,222,128,0.3)", display:"flex", alignItems:"center", justifyContent:"center", animation:"success-pop 0.5s ease" }}>
                      <CheckCircle2 size={36} color="#4ade80" />
                    </div>
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:800, color:"#f9fafb", marginBottom:8 }}>Authentication Successful!</h2>
                  <div style={{ display:"inline-block", background:"rgba(74,222,128,0.08)", border:"1px solid rgba(74,222,128,0.2)", borderRadius:8, padding:"5px 14px", marginBottom:20 }}>
                    <span style={{ color:"#86efac", fontSize:13, fontFamily:"'JetBrains Mono',monospace" }}>{successEmail}</span>
                  </div>
                  <p style={{ color:"#6b7280", fontSize:13, marginBottom:24 }}>
                    {callbackUrl ? "Redirecting back to your terminal in 2 seconds..." : "You can close this tab and return to your terminal."}
                  </p>
                  {/* Terminal confirmation */}
                  <div style={{
                    background:"#020817", border:"1px solid rgba(74,222,128,0.15)",
                    borderRadius:12, padding:"16px 20px", textAlign:"left",
                    fontFamily:"'JetBrains Mono',monospace", fontSize:12,
                  }}>
                    <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                      {["#ff5f57","#ffbd2e","#28c840"].map((c,i) => <div key={i} style={{ width:9, height:9, borderRadius:"50%", background:c }} />)}
                    </div>
                    <div style={{ lineHeight:1.9, color:"#374151" }}>
                      <div><span style={{ color:"#4ade80" }}>✅</span> <span style={{ color:"#e2e8f0" }}>Authenticated as {successEmail}</span></div>
                      <div><span style={{ color:"#4ade80" }}>✅</span> <span style={{ color:"#e2e8f0" }}>Credentials saved → ~/.querycraft/auth.json</span></div>
                      <div style={{ color:"#6b7280" }}>Your MCP session is now active.</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive CSS: show left panel only on lg+ */}
      <style>{`
        .cli-left-panel { display: none !important; }
        @media (min-width: 1024px) { .cli-left-panel { display: flex !important; } }
        input[type="email"]::-webkit-input-placeholder, input[type="password"]::-webkit-input-placeholder { color: #374151; }
      `}</style>
    </>
  )
}

// ─── Suspense wrapper (required for useSearchParams in Next.js) ───────────────
export default function CLIAuthPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#070e0a" }}>
          <div style={{ textAlign:"center" }}>
            <Loader2 size={32} color="#34d399" style={{ animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
            <p style={{ color:"#6b7280", fontSize:13, fontFamily:"Inter, sans-serif" }}>Loading QueryCraft...</p>
          </div>
        </div>
      }
    >
      <CLIAuthInner />
    </Suspense>
  )
}
