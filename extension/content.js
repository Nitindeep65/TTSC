// QueryCraft — In-Situ Floating Spotlight Copilot & Context Menu (Content Script)
// ═══════════════════════════════════════════════════════════════════════════════

(function () {
  if (window.__QUERYCRAFT_INJECTED__) return;
  window.__QUERYCRAFT_INJECTED__ = true;

  const API_BASE = "http://127.0.0.1:8000";
  let hostEl = null;
  let shadowRoot = null;
  let isOpen = false;
  let currentMode = "prompt"; // "prompt" | "explain" | "doctor"
  let lastFocusedElement = null;
  let lastGeneratedSQL = "";

  // 1. Create or Get Shadow DOM Container
  function getShadowRoot() {
    if (!hostEl) {
      hostEl = document.createElement("div");
      hostEl.id = "querycraft-spotlight-root";
      hostEl.style.cssText = "position:fixed;top:0;left:0;width:0;height:0;z-index:2147483647;";
      document.documentElement.appendChild(hostEl);

      // Use 'open' mode — Chrome requires this for content script Shadow DOM
      shadowRoot = hostEl.attachShadow({ mode: "open" });

      // Inject styles as inline <style> — the ONLY Chrome MV3 compatible way.
      // <link href="chrome-extension://..."> is blocked by Chrome's strict CSP inside
      // dynamically-created shadow roots. We fetch the CSS text and inline it instead.
      fetch(chrome.runtime.getURL("content.css"))
        .then(r => r.text())
        .then(css => {
          const styleEl = document.createElement("style");
          styleEl.textContent = css;
          shadowRoot.insertBefore(styleEl, shadowRoot.firstChild);
        })
        .catch(() => {});

      const container = document.createElement("div");
      container.id = "qc-spotlight-wrapper";
      shadowRoot.appendChild(container);
    }
    return shadowRoot;
  }

  // 2. Open / Close Spotlight Bar
  function openSpotlight(mode = "prompt", prefilledText = "") {
    lastFocusedElement = document.activeElement;
    isOpen = true;
    currentMode = mode;

    const root = getShadowRoot();
    renderSpotlight(root, mode, prefilledText);

    setTimeout(() => {
      const inputEl = root.getElementById("qcMainInput");
      if (inputEl) {
        inputEl.focus();
        if (prefilledText) {
          inputEl.select();
          if (mode === "explain" || mode === "doctor") {
            handleSpotlightAction(mode, prefilledText);
          }
        }
      }
    }, 50);
  }

  function closeSpotlight() {
    if (!isOpen) return;
    isOpen = false;
    const root = getShadowRoot();
    const wrapper = root.getElementById("qc-spotlight-wrapper");
    if (wrapper) wrapper.innerHTML = "";
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      try { lastFocusedElement.focus(); } catch (e) {}
    }
  }

  // 3. Render Spotlight UI
  function renderSpotlight(root, mode, text = "") {
    const wrapper = root.getElementById("qc-spotlight-wrapper");
    if (!wrapper) return;

    wrapper.innerHTML = `
      <div class="qc-spotlight-backdrop" id="qcBackdrop">
        <div class="qc-spotlight-modal" id="qcModal">
          
          <!-- Top Header -->
          <div class="qc-modal-header">
            <div class="qc-brand-pill">
              <svg class="qc-brand-icon" viewBox="0 0 24 24">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
              <span>QueryCraft Copilot</span>
            </div>

            <div class="qc-tabs-group">
              <button type="button" class="qc-tab-btn ${mode === 'prompt' ? 'active' : ''}" data-mode="prompt">Prompt to SQL</button>
              <button type="button" class="qc-tab-btn ${mode === 'explain' ? 'active' : ''}" data-mode="explain">Explain SQL</button>
              <button type="button" class="qc-tab-btn ${mode === 'doctor' ? 'active' : ''}" data-mode="doctor">SQL Doctor</button>
            </div>

            <button type="button" class="qc-close-btn" id="qcBtnClose">✕</button>
          </div>

          <!-- Input Row -->
          <div class="qc-input-row">
            <svg class="qc-search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="7" cy="7" r="5"/>
              <path d="m11 11 3.5 3.5"/>
            </svg>
            <input
              type="text"
              id="qcMainInput"
              class="qc-main-input"
              placeholder="${mode === 'prompt' ? 'Ask plain English question or describe SQL…' : mode === 'explain' ? 'Paste SQL query to explain and optimize…' : 'Paste PostgreSQL error message to heal…'}"
              value="${text ? text.replace(/"/g, '&quot;') : ''}"
            />
            <button type="button" class="qc-run-btn" id="qcBtnSubmit">
              <span>Run</span>
              <kbd style="font-size:9.5px;opacity:0.8;">↵</kbd>
            </button>
          </div>

          <!-- Results Body -->
          <div class="qc-modal-body" id="qcModalBody">
            <div style="font-size:12px;color:#6b8275;text-align:center;padding:12px 0;">
              ${mode === 'prompt' ? 'Type a question or press <strong>Cmd+Shift+K</strong> anywhere on the web.' : mode === 'explain' ? 'Analyze query execution cost & index recommendations.' : 'Diagnose PostgreSQL runtime error and generate auto-repaired SQL.'}
            </div>
          </div>

          <!-- Footer -->
          <div class="qc-modal-footer">
            <div class="qc-shortcut-hint">
              <span><span class="qc-kbd">Esc</span> Close</span>
              <span><span class="qc-kbd">Enter</span> Run</span>
              <span><span class="qc-kbd">Cmd+Shift+K</span> Toggle</span>
            </div>
            <a href="http://localhost:3000/Dashboard/chat" target="_blank" class="qc-open-studio-link">
              Open in Web Studio ↗
            </a>
          </div>

        </div>
      </div>
    `;

    // Event Bindings
    const backdrop = root.getElementById("qcBackdrop");
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeSpotlight();
    });

    root.getElementById("qcBtnClose").addEventListener("click", closeSpotlight);

    const input = root.getElementById("qcMainInput");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSpotlight();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSpotlightAction(currentMode, input.value.trim());
      }
    });

    root.getElementById("qcBtnSubmit").addEventListener("click", () => {
      handleSpotlightAction(currentMode, input.value.trim());
    });

    // Mode Tabs
    root.querySelectorAll(".qc-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const nextMode = btn.getAttribute("data-mode");
        currentMode = nextMode;
        root.querySelectorAll(".qc-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        input.placeholder = nextMode === "prompt"
          ? "Ask plain English question or describe SQL…"
          : nextMode === "explain"
          ? "Paste SQL query to explain and optimize…"
          : "Paste PostgreSQL error message to heal…";
        input.focus();
      });
    });
  }

  // 4. Action Handlers (API Calls)
  async function handleSpotlightAction(mode, text) {
    if (!text) return;
    const root = getShadowRoot();
    const body = root.getElementById("qcModalBody");
    const submitBtn = root.getElementById("qcBtnSubmit");

    if (!body) return;
    body.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:24px 0;color:#6ee7b7;">
        <span style="display:inline-block;width:16px;height:16px;border:2px solid #34d399;border-top-color:transparent;border-radius:50%;animation:qc-spin 0.6s linear infinite;"></span>
        <span style="font-size:12.5px;font-weight:600;">Processing with Llama 3.1 &amp; PostgreSQL Engine…</span>
      </div>
      <style>@keyframes qc-spin { to { transform: rotate(360deg); } }</style>
    `;
    if (submitBtn) submitBtn.disabled = true;

    try {
      if (mode === "prompt") {
        // PROMPT TO SQL
        const res = await fetch(`${API_BASE}/api/clarification/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_prompt: text })
        });
        const data = await res.json();

        if (data.status === "needs_clarification") {
          body.innerHTML = `
            <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:12px;">
              <p style="font-size:11px;font-weight:700;color:#fbbf24;text-transform:uppercase;margin-bottom:4px;">Clarification Needed</p>
              <p style="font-size:13px;color:#fef3c7;line-height:1.4;">${escapeHtml(data.message)}</p>
            </div>
          `;
        } else if (data.status === "complete" && data.extracted_data) {
          const sql = data.extracted_data.sql_query;
          lastGeneratedSQL = sql;
          body.innerHTML = `
            <div class="qc-code-card">
              <div class="qc-code-header">
                <span>Verified PostgreSQL</span>
                <div class="qc-code-actions">
                  <button type="button" class="qc-action-pill primary" id="qcBtnInsert">⚡ Insert to Editor</button>
                  <button type="button" class="qc-action-pill" id="qcBtnCopy">Copy SQL</button>
                  <button type="button" class="qc-action-pill" id="qcBtnExplain">EXPLAIN</button>
                </div>
              </div>
              <pre class="qc-code-content"><code>${escapeHtml(sql)}</code></pre>
            </div>
            ${data.extracted_data.explanation ? `<p style="font-size:12px;color:#8da596;line-height:1.4;">${escapeHtml(data.extracted_data.explanation)}</p>` : ''}
            <div id="qcInlineResults"></div>
          `;

          // Bind Actions
          root.getElementById("qcBtnInsert")?.addEventListener("click", () => insertSQLToActiveEditor(sql));
          root.getElementById("qcBtnCopy")?.addEventListener("click", () => copyToClipboard(sql, root.getElementById("qcBtnCopy")));
          root.getElementById("qcBtnExplain")?.addEventListener("click", () => handleSpotlightAction("explain", sql));
        } else {
          body.innerHTML = `<div style="color:#f87171;font-size:12px;">${escapeHtml(data.message || "Failed to generate SQL.")}</div>`;
        }

      } else if (mode === "explain") {
        // EXPLAIN & PERFORMANCE GUARD
        const res = await fetch(`${API_BASE}/api/database/explain`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ connection_uri: "", sql_query: text })
        });
        const data = await res.json();
        const perf = data.performance_rating || "moderate";
        const perfCls = perf === "fast" ? "qc-perf-fast" : perf === "moderate" ? "qc-perf-mod" : "qc-perf-heavy";
        const perfIcon = perf === "fast" ? "🟢" : perf === "moderate" ? "🟡" : "🔴";

        body.innerHTML = `
          <div class="qc-badge-row">
            <span class="qc-perf-badge ${perfCls}">${perfIcon} ${data.rating_label || perf.toUpperCase()}</span>
            <span style="font-size:11px;color:#8da596;">Cost: <strong>${data.total_cost || 0}</strong></span>
            <span style="font-size:11px;color:#8da596;">Est. Rows: <strong>${data.plan_rows || 0}</strong></span>
            ${data.has_seq_scan ? `<span style="font-size:10.5px;color:#f87171;font-weight:700;">⚠️ Seq Scan Detected</span>` : `<span style="font-size:10.5px;color:#34d399;font-weight:700;">✓ Indexed Scan</span>`}
          </div>

          ${data.scan_details && data.scan_details.length > 0 ? `
            <div style="background:#0a110d;border:1px solid #1f2f25;border-radius:8px;padding:8px 12px;">
              <p style="font-size:10px;font-weight:700;color:#6ee7b7;text-transform:uppercase;margin-bottom:4px;">Scan Plan Details</p>
              ${data.scan_details.map(s => `<p style="font-size:11.5px;color:#c4e6d2;font-family:monospace;">• ${escapeHtml(s)}</p>`).join('')}
            </div>
          ` : ''}

          ${data.index_recommendations && data.index_recommendations.length > 0 ? `
            <div class="qc-code-card">
              <div class="qc-code-header">
                <span style="color:#34d399;">⚡ Recommended Index DDL</span>
                <button type="button" class="qc-action-pill" id="qcBtnCopyIdx">Copy Index DDL</button>
              </div>
              <pre class="qc-code-content"><code>${escapeHtml(data.index_recommendations.join('\n'))}</code></pre>
            </div>
          ` : ''}
        `;

        root.getElementById("qcBtnCopyIdx")?.addEventListener("click", () => {
          copyToClipboard(data.index_recommendations.join('\n'), root.getElementById("qcBtnCopyIdx"));
        });

      } else if (mode === "doctor") {
        // SQL ERROR DOCTOR
        const res = await fetch(`${API_BASE}/api/database/diagnose`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error_message: text, failing_sql: lastGeneratedSQL || null })
        });
        const data = await res.json();

        body.innerHTML = `
          <div class="qc-doctor-card">
            <div class="qc-doctor-title">
              <span>🩺 SQL Doctor Diagnosis</span>
              ${data.error_code ? `<span style="font-size:10px;background:rgba(239,68,68,0.2);padding:2px 6px;border-radius:4px;">Code: ${data.error_code}</span>` : ''}
            </div>
            <p class="qc-doctor-body">${escapeHtml(data.root_cause)}</p>
            ${data.explanation ? `<p style="font-size:11.5px;color:#fecaca;margin-top:2px;">${escapeHtml(data.explanation)}</p>` : ''}
          </div>

          ${data.healed_sql ? `
            <div class="qc-code-card">
              <div class="qc-code-header">
                <span style="color:#5de08a;">✓ Auto-Healed SQL</span>
                <div class="qc-code-actions">
                  <button type="button" class="qc-action-pill primary" id="qcBtnInsertHealed">Insert Fixed SQL</button>
                  <button type="button" class="qc-action-pill" id="qcBtnCopyHealed">Copy</button>
                </div>
              </div>
              <pre class="qc-code-content"><code>${escapeHtml(data.healed_sql)}</code></pre>
            </div>
          ` : ''}
        `;

        if (data.healed_sql) {
          root.getElementById("qcBtnInsertHealed")?.addEventListener("click", () => insertSQLToActiveEditor(data.healed_sql));
          root.getElementById("qcBtnCopyHealed")?.addEventListener("click", () => copyToClipboard(data.healed_sql, root.getElementById("qcBtnCopyHealed")));
        }
      }
    } catch (err) {
      body.innerHTML = `
        <div style="color:#f87171;font-size:12px;padding:12px;background:rgba(239,68,68,0.1);border-radius:8px;">
          <strong>Error communicating with backend:</strong> ${escapeHtml(err.message || 'Make sure FastAPI backend is running on 127.0.0.1:8000')}.
        </div>
      `;
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  // 5. In-Page Active Editor Insertion
  function insertSQLToActiveEditor(sql) {
    closeSpotlight();
    if (!lastFocusedElement) {
      navigator.clipboard.writeText(sql);
      return;
    }

    const el = lastFocusedElement;
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      const val = el.value || "";
      el.value = val.substring(0, start) + sql + val.substring(end);
      el.selectionStart = el.selectionEnd = start + sql.length;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    } else if (el.isContentEditable) {
      // document.execCommand is deprecated — use modern Selection + insertText input event
      el.focus();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        sel.getRangeAt(0).deleteContents();
        sel.getRangeAt(0).insertNode(document.createTextNode(sql));
        sel.collapseToEnd();
      } else {
        el.textContent = (el.textContent || "") + sql;
      }
      el.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: sql }));
    } else {
      // Monaco / CodeMirror — fall back to clipboard
      navigator.clipboard.writeText(sql).catch(() => {});
    }
  }

  // 6. Clipboard Helper
  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) {
        const orig = btn.innerText;
        btn.innerText = "✓ Copied!";
        setTimeout(() => { btn.innerText = orig; }, 1500);
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 7. Global Keyboard Shortcut Listener (Cmd+Shift+K / Ctrl+Shift+K)
  window.addEventListener("keydown", (e) => {
    // navigator.platform is deprecated in Chrome — use userAgentData if available, else userAgent string
    const isMac = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent).toLowerCase().includes("mac");
    const isModifier = isMac ? e.metaKey : e.ctrlKey;

    if (isModifier && e.shiftKey && (e.key === "K" || e.key === "k")) {
      e.preventDefault();
      if (isOpen) {
        closeSpotlight();
      } else {
        const selection = window.getSelection()?.toString().trim() || "";
        openSpotlight("prompt", selection);
      }
    }
  });

  // 8. Chrome Runtime Message Listener
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_SPOTLIGHT") {
      if (isOpen) closeSpotlight();
      else openSpotlight("prompt", window.getSelection()?.toString().trim() || "");
      sendResponse({ status: "ok" });
    } else if (message.type === "OPEN_SPOTLIGHT") {
      openSpotlight(message.action || "prompt", message.selectedText || "");
      sendResponse({ status: "ok" });
    }
  });

})();
