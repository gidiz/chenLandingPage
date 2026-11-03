/*
  docs-agent-loop.js
  Interactive simulation of the Orchestrator loopback defined in
  .github/agents/orchestrator.agent.md (plan 006).

  Loaded by docs-agent-team-expansion-summary.html.
  No dependencies, no network, no build step.
*/
;(function () {
  "use strict"

  const MAX_RETRIES = 3

  // Agent chain — order matches Orchestrator Step 3.
  const AGENTS = [
    { id: "db", name: "DB Agent", kind: "implementer", domain: "server/db" },
    { id: "backend", name: "Backend Agent", kind: "implementer", domain: "server/api · rag · mcp" },
    { id: "frontend", name: "Frontend Agent", kind: "implementer", domain: "components · pages" },
    { id: "specialists", name: "Specialists (on-demand)", kind: "implementer", domain: "Content · SEO · Analytics · RAG Quality · Release/Ops", optional: true },
    { id: "backend-security", name: "Backend Security Agent", kind: "reviewer", target: "backend" },
    { id: "frontend-security", name: "Frontend Security Agent", kind: "reviewer", target: "frontend" },
    { id: "compliance", name: "Compliance & Accessibility Reviewer", kind: "reviewer", target: "frontend" },
    { id: "qa", name: "QA Agent", kind: "reviewer", target: "frontend" },
  ]

  // Sample failures a reviewer can raise (Medium+ blocks, Low is advisory).
  const SAMPLE_FINDINGS = {
    "backend-security": [
      { severity: "Medium", text: "Missing Origin/Referer check on POST /api/chat" },
      { severity: "High", text: "MAX_MESSAGE_LENGTH raised above 1200" },
      { severity: "Low", text: "Shared rate-limit store recommended for multi-instance" },
    ],
    "frontend-security": [
      { severity: "High", text: "New v-html binding outside the accepted list" },
      { severity: "Medium", text: "JSON-LD innerHTML not escaping '<'" },
      { severity: "Low", text: "Security headers via routeRules recommended" },
    ],
    compliance: [
      { severity: "Critical", text: "Prohibited claim: 'תוצאות מובטחות'" },
      { severity: "High", text: "Icon-only button without aria-label" },
      { severity: "Low", text: "Skip-link missing" },
    ],
    qa: [
      { severity: "High", text: "npm run build exit code 1 — TS2322" },
      { severity: "Medium", text: "console.log found in server/api" },
    ],
  }

  const BLOCKING = new Set(["Critical", "High", "Medium"])

  // ---------- Simulation state ----------

  function createRun(options) {
    return {
      failRate: options.failRate,
      seed: options.seed,
      retries: {},          // reviewerId -> count
      step: 0,              // index into AGENTS
      log: [],
      status: "idle",       // idle | running | pass | blocked
      events: [],           // queued events for the visual "event loop"
    }
  }

  // Deterministic PRNG so the same seed replays the same run.
  function rng(seed) {
    let s = seed >>> 0 || 1
    return function () {
      s ^= s << 13
      s ^= s >>> 17
      s ^= s << 5
      return ((s >>> 0) % 10000) / 10000
    }
  }

  function pick(random, list) {
    return list[Math.floor(random() * list.length)]
  }

  // Builds the full event list up-front; the UI then drains it like an event loop.
  function plan(run) {
    const random = rng(run.seed)
    const events = []
    let i = 0

    while (i < AGENTS.length) {
      const agent = AGENTS[i]

      if (agent.kind === "implementer") {
        events.push({ type: "implement", agent })
        i += 1
        continue
      }

      const finding = pick(random, SAMPLE_FINDINGS[agent.id])
      const fails = random() < run.failRate && BLOCKING.has(finding.severity)

      if (!fails) {
        const advisory = BLOCKING.has(finding.severity) ? null : finding
        events.push({ type: "pass", agent, advisory })
        i += 1
        continue
      }

      run.retries[agent.id] = (run.retries[agent.id] || 0) + 1
      const count = run.retries[agent.id]
      const target = AGENTS.find((a) => a.id === agent.target)

      events.push({ type: "fail", agent, finding, target, retry: count })

      if (count >= MAX_RETRIES) {
        events.push({ type: "blocked", agent, retry: count })
        return events
      }

      events.push({ type: "loopback", agent, target, retry: count })
      events.push({ type: "implement", agent: target, fix: finding })
      // Re-run only the failing reviewer, then continue the chain.
    }

    events.push({ type: "done" })
    return events
  }

  // ---------- Rendering ----------

  function el(tag, attrs, children) {
    const node = document.createElement(tag)
    if (attrs) {
      Object.keys(attrs).forEach((key) => {
        if (key === "class") node.className = attrs[key]
        else if (key === "text") node.textContent = attrs[key]
        else node.setAttribute(key, attrs[key])
      })
    }
    ;(children || []).forEach((child) => node.appendChild(child))
    return node
  }

  function renderChain(root) {
    const chain = el("div", { class: "loop__chain", role: "list" })
    AGENTS.forEach((agent) => {
      const node = el("div", {
        class: "loop__node loop__node--" + agent.kind + (agent.optional ? " loop__node--optional" : ""),
        "data-agent": agent.id,
        role: "listitem",
      }, [
        el("div", { class: "loop__node-name", text: agent.name }),
        el("div", { class: "loop__node-meta", text: agent.domain || (agent.kind === "reviewer" ? "read-only · PASS / FAIL" : "") }),
        el("div", { class: "loop__node-retry", "aria-live": "polite" }),
      ])
      chain.appendChild(node)
    })
    root.appendChild(chain)
    return chain
  }

  function setNodeState(chain, agentId, state) {
    const node = chain.querySelector('[data-agent="' + agentId + '"]')
    if (!node) return
    node.classList.remove("is-active", "is-pass", "is-fail", "is-blocked")
    if (state) node.classList.add("is-" + state)
  }

  function setRetry(chain, agentId, count) {
    const node = chain.querySelector('[data-agent="' + agentId + '"] .loop__node-retry')
    if (node) node.textContent = count ? "ניסיון " + count + " / " + MAX_RETRIES : ""
  }

  function logLine(logRoot, kind, html) {
    const line = el("div", { class: "loop__log-line loop__log-line--" + kind })
    line.innerHTML = html
    logRoot.appendChild(line)
    logRoot.scrollTop = logRoot.scrollHeight
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[ch])
  }

  // ---------- Controller (the "event loop") ----------

  function mount(root) {
    const controls = el("div", { class: "loop__controls" })
    const failLabel = el("label", { for: "loop-fail-rate", text: "סיכוי לכישלון בכל סוקר" })
    const failInput = el("input", { id: "loop-fail-rate", type: "range", min: "0", max: "100", step: "5", value: "40" })
    const failValue = el("span", { class: "loop__value", text: "40%" })
    const seedLabel = el("label", { for: "loop-seed", text: "seed" })
    const seedInput = el("input", { id: "loop-seed", type: "number", min: "1", max: "9999", value: "7" })
    const speedLabel = el("label", { for: "loop-speed", text: "מהירות" })
    const speedSelect = el("select", { id: "loop-speed" })
    ;[["1200", "איטי"], ["600", "רגיל"], ["200", "מהיר"]].forEach(([value, text]) => {
      const option = el("option", { value, text })
      if (value === "600") option.selected = true
      speedSelect.appendChild(option)
    })
    const runButton = el("button", { type: "button", class: "loop__button", text: "הרץ סימולציה" })
    const resetButton = el("button", { type: "button", class: "loop__button loop__button--ghost", text: "איפוס" })

    failInput.addEventListener("input", () => { failValue.textContent = failInput.value + "%" })

    controls.append(failLabel, failInput, failValue, seedLabel, seedInput, speedLabel, speedSelect, runButton, resetButton)
    root.appendChild(controls)

    const chain = renderChain(root)
    const status = el("div", { class: "loop__status", role: "status", "aria-live": "polite", text: "מוכן. בחר/י פרמטרים והרץ/י." })
    const logRoot = el("div", { class: "loop__log", "aria-label": "יומן אירועים" })
    root.append(status, logRoot)

    let timer = null

    function reset() {
      if (timer) { clearTimeout(timer); timer = null }
      AGENTS.forEach((agent) => { setNodeState(chain, agent.id, null); setRetry(chain, agent.id, 0) })
      logRoot.innerHTML = ""
      status.textContent = "מוכן. בחר/י פרמטרים והרץ/י."
      status.className = "loop__status"
      runButton.disabled = false
    }

    function start() {
      reset()
      runButton.disabled = true
      const run = createRun({ failRate: Number(failInput.value) / 100, seed: Number(seedInput.value) })
      const queue = plan(run)
      const delay = Number(speedSelect.value)
      status.textContent = "רץ…"

      // Drain the queue one event per tick — this is the visible "event loop".
      function tick() {
        const event = queue.shift()
        if (!event) { runButton.disabled = false; return }
        handle(event)
        timer = setTimeout(tick, delay)
      }

      function handle(event) {
        switch (event.type) {
          case "implement":
            setNodeState(chain, event.agent.id, "active")
            logLine(logRoot, "implement",
              "<strong>[" + escapeHtml(event.agent.name) + "]</strong> " +
              (event.fix ? "מתקן: " + escapeHtml(event.fix.text) : "מבצע שינוי"))
            setTimeout(() => setNodeState(chain, event.agent.id, "pass"), delay * 0.8)
            break

          case "pass":
            setNodeState(chain, event.agent.id, "pass")
            logLine(logRoot, "pass",
              "<strong>[" + escapeHtml(event.agent.name) + "]</strong> ✅ Verdict: PASS" +
              (event.advisory ? ' <span class="loop__advisory">Low advisory: ' + escapeHtml(event.advisory.text) + "</span>" : ""))
            break

          case "fail":
            setNodeState(chain, event.agent.id, "fail")
            setRetry(chain, event.agent.id, event.retry)
            logLine(logRoot, "fail",
              "<strong>[" + escapeHtml(event.agent.name) + "]</strong> ❌ Loopback Triggered — " +
              '<span class="loop__sev loop__sev--' + event.finding.severity.toLowerCase() + '">' + event.finding.severity + "</span> " +
              escapeHtml(event.finding.text) + " → Target: <strong>[" + escapeHtml(event.target.name) + "]</strong>")
            break

          case "loopback":
            setNodeState(chain, event.target.id, "active")
            logLine(logRoot, "loop",
              "↩ Orchestrator מחזיר ל-<strong>[" + escapeHtml(event.target.name) + "]</strong> עם לוג הכישלון (ניסיון " + event.retry + "/" + MAX_RETRIES + ")")
            break

          case "blocked":
            setNodeState(chain, event.agent.id, "blocked")
            status.textContent = "status:blocked — 3 כישלונות רצופים ב-" + event.agent.name + ". נדרשת התערבות אנושית."
            status.className = "loop__status loop__status--blocked"
            logLine(logRoot, "blocked", "🛑 <strong>status:blocked</strong> — הגענו ל-" + MAX_RETRIES + " ניסיונות. Orchestrator עוצר ומבקש התערבות אנושית.")
            break

          case "done":
            status.textContent = "✅ QA PASS — כל ה-acceptance criteria סומנו, התוכנית מסומנת done."
            status.className = "loop__status loop__status--pass"
            logLine(logRoot, "done", "🎉 Orchestrator: Status: done · Issue נסגר")
            break
        }
      }

      tick()
    }

    runButton.addEventListener("click", start)
    resetButton.addEventListener("click", reset)
  }

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("agent-loop")
    if (root) mount(root)
  })
})()
