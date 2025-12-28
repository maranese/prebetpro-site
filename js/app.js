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
   PREDICTION CARD (UNIT)
========================= */
function renderPredictionCard({ label, value, strong }) {
  const card = document.createElement("div");
  card.className = `prediction-card${strong ? " highlight" : ""}`;
  card.dataset.value = value;

  card.innerHTML = `
    <div class="prediction-market">${label}</div>
    <div class="prediction-value">${value}%</div>
  `;

  return card;
}

/* =========================
   MATCH CARD (COMPOSER)
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = `match-card dashboard confidence-${f.confidence}`;

  const date = new Date(f.fixture.date);
  const time = date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const dayLabel = getDayLabel(date);

  const scores = [];
  if (f.score?.halftime?.home != null)
    scores.push(`HT ${f.score.halftime.home}–${f.score.halftime.away}`);
  if (f.score?.fulltime?.home != null)
    scores.push(`FT ${f.score.fulltime.home}–${f.score.fulltime.away}`);
  if (f.score?.extratime?.home != null)
    scores.push(`ET ${f.score.extratime.home}–${f.score.extratime.away}`);
  if (f.score?.penalty?.home != null)
    scores.push(`PEN ${f.score.penalty.home}–${f.score.penalty.away}`);

  const inlinePredictions = getInlinePredictions(f);

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

    <div class="match-inline-predictions"></div>
  `;

  const predBox = card.querySelector(".match-inline-predictions");
  inlinePredictions.forEach(p => predBox.appendChild(renderPredictionCard(p)));

  return card;
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
    { label: "1X", value: p.home_draw, strong: s.home_draw },
    { label: "X2", value: p.away_draw, strong: s.away_draw },
    { label: "12", value: p.home_away, strong: s.home_away },
    { label: "Over 1.5", value: p.over_15, strong: s.over_15 },
    { label: "Under 1.5", value: p.under_15, strong: s.under_15 },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 }
  ]
    .filter(x => x.value != null && x.value >= 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/* =========================
   PREDICTIONS SECTION
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  box.innerHTML = "";

  fixtures.forEach(f => {
    const wrap = document.createElement("div");
    wrap.className = "prediction-match-group";

    const title = document.createElement("h3");
    title.textContent = `${f.teams.home.name} vs ${f.teams.away.name}`;
    wrap.appendChild(title);

    if (f.confidence !== "high" || !f.predictions) {
      const msg = document.createElement("div");
      msg.className = "no-data";
      msg.innerHTML = STATUS_MESSAGES.no_data;
      wrap.appendChild(msg);
      box.appendChild(wrap);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "predictions-grid";

    getAllPredictions(f).forEach(p =>
      grid.appendChild(renderPredictionCard(p))
    );

    wrap.appendChild(grid);
    box.appendChild(wrap);
  });
}

/* =========================
   ALL PREDICTIONS (FULL)
========================= */
function getAllPredictions(f) {
  const p = f.predictions;
  const s = p.strength || {};

  return [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "1X", value: p.home_draw, strong: s.home_draw },
    { label: "X2", value: p.away_draw, strong: s.away_draw },
    { label: "12", value: p.home_away, strong: s.home_away },
    { label: "Over 1.5", value: p.over_15, strong: s.over_15 },
    { label: "Under 1.5", value: p.under_15, strong: s.under_15 },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 }
  ].filter(x => x.value != null);
}

/* =========================
   DETAILS
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
   CONFIDENCE LABEL
========================= */
function formatConfidence(level) {
  if (level === "high") return "High confidence";
  if (level === "medium") return "Medium confidence";
  return "Low confidence";
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
