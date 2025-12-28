document.addEventListener("DOMContentLoaded", () => {
  loadTodayMatches();
  loadMatches();
  initBackToTop();
});

/* =========================
   STATUS MESSAGES
========================= */
const STATUS_MESSAGES = {
  no_data: `
    Insufficient historical data.<br>
    We don’t generate predictions when data is unreliable.
  `,
  api_unavailable: `Data temporarily unavailable.`,
  api_limited: `
    Data update temporarily limited.<br>
    Information will refresh automatically.
  `
};

/* =========================
   LOAD MATCHES (ROOT API)
========================= */
async function loadMatches() {
  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) {
      renderGlobalStatus("api_unavailable");
      return;
    }

    const data = await res.json();
    const fixtures = data.fixtures || [];

    renderStatistics(fixtures);
    renderPredictions(fixtures);

    if (data.status && data.status !== "ok") {
      renderGlobalStatus(data.status);
    }
  } catch (err) {
    console.error(err);
    renderGlobalStatus("api_unavailable");
  }
}

/* =========================
   LOAD TODAY MATCHES
========================= */
async function loadTodayMatches() {
  const container = document.getElementById("matches");
  const noMatches = document.getElementById("no-matches");
  if (!container) return;

  container.innerHTML = "";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) return;

    const data = await res.json();
    const fixtures = data.fixtures || [];

    if (!fixtures.length) {
      noMatches.style.display = "block";
      return;
    }

    noMatches.style.display = "none";

    fixtures
      .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date))
      .forEach(f => container.appendChild(renderMatchCard(f)));

  } catch (err) {
    console.error(err);
  }
}

/* =========================
   MATCH CARD — MINI DASHBOARD
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = `match-card dashboard confidence-${f.confidence}`;

  const fixtureDate = new Date(f.fixture.date);
  const time = fixtureDate.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const dayLabel = getDayLabel(fixtureDate);

  const scores = [];
  if (f.score?.halftime?.home != null)
    scores.push(`HT ${f.score.halftime.home}–${f.score.halftime.away}`);
  if (f.score?.fulltime?.home != null)
    scores.push(`FT ${f.score.fulltime.home}–${f.score.fulltime.away}`);
  if (f.score?.extratime?.home != null)
    scores.push(`ET ${f.score.extratime.home}–${f.score.extratime.away}`);
  if (f.score?.penalty?.home != null)
    scores.push(`PEN ${f.score.penalty.home}–${f.score.penalty.away}`);

  const predictions = getInlinePredictions(f);

  card.innerHTML = `
    ${dayLabel ? `<div class="match-day">${dayLabel}</div>` : ""}

    <div class="match-league">${f.league.name}</div>

    <div class="match-main">
      <div class="match-row primary">
        <span class="match-time">${time}</span>
        <span class="match-teams">${f.teams.home.name} vs ${f.teams.away.name}</span>
        <span class="confidence-badge">${formatConfidence(f.confidence)}</span>
      </div>

      <div class="match-row scores">
        ${scores.map(s => `<span>${s}</span>`).join("")}
      </div>

      <button class="match-toggle" onclick="toggleDetails(this)">
        Show details ⌄
      </button>

      <div class="match-details">
        ${renderMatchDetails(f)}
      </div>
    </div>

    <div class="match-predictions">
      ${predictions.map(p => `
        <div class="prediction-box ${p.strong ? "highlight" : ""}">
          <div class="prediction-market">${p.label}</div>
          <div class="prediction-value">${p.value}%</div>
        </div>
      `).join("")}
    </div>
  `;

  return card;
}

/* =========================
   DAY LABEL
========================= */
function getDayLabel(date) {
  const today = new Date();
  today.setHours(0,0,0,0);

  const d = new Date(date);
  d.setHours(0,0,0,0);

  const diff = (d - today) / 86400000;
  const formatted = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  if (diff === 0) return `TODAY · ${formatted}`;
  if (diff === 1) return `TOMORROW · ${formatted}`;
  if (diff === -1) return `YESTERDAY · ${formatted}`;
  return "";
}

/* =========================
   INLINE PREDICTIONS (≤3)
========================= */
function getInlinePredictions(f) {
  if (f.confidence === "low" || !f.predictions?.strength) return [];

  const p = f.predictions;
  const s = p.strength;

  return [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 },
    { label: "Goal", value: p.btts, strong: s.btts },
    { label: "No Goal", value: p.no_btts, strong: s.no_btts }
  ]
    .filter(x => x.value != null && x.value >= 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/* =========================
   MATCH DETAILS (SAFE)
========================= */
function renderMatchDetails(f) {
  const v = f.fixture.venue;
  const r = f.fixture.referee;

  if (!v && !r) return `<em>No additional data available.</em>`;

  return `
    ${v ? `<div>🏟 ${v.name}</div>` : ""}
    ${r ? `<div>👨‍⚖️ ${r}</div>` : ""}
  `;
}

function toggleDetails(btn) {
  const box = btn.nextElementSibling;
  box.classList.toggle("open");
  btn.textContent = box.classList.contains("open")
    ? "Hide details ⌃"
    : "Show details ⌄";
}

/* =========================
   CONFIDENCE LABEL
========================= */
function formatConfidence(level) {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
}

/* =========================
   STATISTICS
========================= */
function renderStatistics(fixtures) {
  const box = document.getElementById("stats-summary");
  if (!box) return;

  let ns = 0, live = 0, ft = 0;
  fixtures.forEach(f => {
    const s = f.fixture.status.short;
    if (s === "NS") ns++;
    else if (["1H", "HT", "2H"].includes(s)) live++;
    else if (["FT", "AET", "PEN"].includes(s)) ft++;
  });

  box.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total</p></div>
    <div class="stat-card"><h3>${ns}</h3><p>Not started</p></div>
    <div class="stat-card"><h3>${live}</h3><p>Live</p></div>
    <div class="stat-card"><h3>${ft}</h3><p>Finished</p></div>
  `;
}

/* =========================
   PREDICTIONS SECTION
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  box.innerHTML = "";

  fixtures.forEach(match => {
    const card = document.createElement("div");
    card.className = "prediction-card";

    const home = match.teams.home.name;
    const away = match.teams.away.name;

    if (match.confidence !== "high") {
      card.innerHTML = `
        <div class="prediction-header">${home} vs ${away}</div>
        <div class="prediction-info">${STATUS_MESSAGES.no_data}</div>
      `;
      box.appendChild(card);
      return;
    }

    const p = match.predictions;
    card.innerHTML = `
      <div class="prediction-header">${home} vs ${away}</div>
      <div class="prediction-grid">
        <div class="prediction-item">1 <strong>${p.home_win}%</strong></div>
        <div class="prediction-item">X <strong>${p.draw}%</strong></div>
        <div class="prediction-item">2 <strong>${p.away_win}%</strong></div>
      </div>
    `;
    box.appendChild(card);
  });
}

/* =========================
   GLOBAL STATUS
========================= */
function renderGlobalStatus(status) {
  const msg = STATUS_MESSAGES[status];
  if (!msg) return;

  ["predictions-list", "top-picks-list"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = `<div class="no-data">${msg}</div>`;
  });
}

/* =========================
   BACK TO TOP
========================= */
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.style.display = window.scrollY > 300 ? "block" : "none";
  });

  btn.onclick = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
}
