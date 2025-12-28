document.addEventListener("DOMContentLoaded", () => {
  loadTodayMatches();
  loadMatches();
  initBackToTop();
});

/* =========================
   STATUS MESSAGES (GLOBAL)
========================= */
const STATUS_MESSAGES = {
  no_data: `
    Insufficient historical data.<br>
    We don’t generate predictions when data is unreliable.
  `,
  api_unavailable: `
    Data temporarily unavailable.
  `,
  api_limited: `
    Data update temporarily limited.<br>
    Information will refresh automatically.
  `
};

/* =========================
   LOAD MATCHES (API ROOT)
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

    if (data.status && data.status !== "ok") {
      renderGlobalStatus(data.status);
    }

    renderPredictions(fixtures);

  } catch (err) {
    console.error("loadMatches error:", err);
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
   MATCH CARD (MINI DASHBOARD)
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = `match-card dashboard confidence-${f.confidence}`;

  const time = new Date(f.fixture.date).toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const status = f.fixture.status.short;
  const ht = f.score?.halftime;
  const ft = f.score?.fulltime;
  const et = f.score?.extratime;
  const pen = f.score?.penalty;

  let scoreHtml = "";
  if (ht?.home != null) scoreHtml += `<span>HT ${ht.home}–${ht.away}</span>`;
  if (ft?.home != null) scoreHtml += `<span>FT ${ft.home}–${ft.away}</span>`;
  if (status === "AET" && et) scoreHtml += `<span>ET ${et.home}–${et.away}</span>`;
  if (status === "PEN" && pen) scoreHtml += `<span>PEN ${pen.home}–${pen.away}</span>`;

  const bestMarkets = getBestMarkets(f);

  card.innerHTML = `
    <div class="match-main">
      <div class="match-header">
        <span class="match-time">${time}</span>
        <span class="match-teams">${f.teams.home.name} vs ${f.teams.away.name}</span>
        <span class="confidence-badge confidence-${f.confidence}">
          ${formatConfidence(f.confidence)}
        </span>
      </div>

      <div class="match-league">${f.league.name}</div>

      <div class="match-scores">
        ${scoreHtml || ""}
      </div>

      <a class="show-all" href="#predictions">Show all</a>
    </div>

    <div class="match-predictions">
      ${
        bestMarkets.length
          ? bestMarkets.map(m => `
              <div class="prediction-box ${m.strong ? "highlight" : ""}">
                <div class="market">${m.label}</div>
                <div class="value">${m.value}%</div>
              </div>
            `).join("")
          : ""
      }
    </div>
  `;

  return card;
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
   BEST MARKETS
========================= */
function getBestMarkets(f) {
  if (!f.predictions?.strength) return [];

  const p = f.predictions;
  const s = p.strength;

  return [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Goal", value: p.btts, strong: s.btts },
    { label: "No Goal", value: p.no_btts, strong: s.no_btts }
  ]
    .filter(m => m.value != null && m.value >= 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/* =========================
   MARKET RENDER (UNTOUCHED)
========================= */
function renderMarket(label, value, isStrong) {
  return `
    <div class="prediction-item ${isStrong ? "highlight" : ""}">
      ${label}
      <strong>${value}%</strong>
    </div>
  `;
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
   PREDICTIONS
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

    if (match.confidence !== "high" || !match.predictions) {
      card.innerHTML = `
        <div class="prediction-header">${home} vs ${away}</div>
        <div class="prediction-info">${STATUS_MESSAGES.no_data}</div>
      `;
      box.appendChild(card);
      return;
    }

    const p = match.predictions;
    const hi = v => v >= 70 ? "highlight" : "";

    card.innerHTML = `
      <div class="prediction-header">${home} vs ${away}</div>
      <div class="prediction-grid">
        <div class="prediction-item ${hi(p.home_win)}">1 <strong>${p.home_win}%</strong></div>
        <div class="prediction-item ${hi(p.draw)}">X <strong>${p.draw}%</strong></div>
        <div class="prediction-item ${hi(p.away_win)}">2 <strong>${p.away_win}%</strong></div>
      </div>
    `;

    box.appendChild(card);
  });
}

/* =========================
   GLOBAL STATUS RENDER
========================= */
function renderGlobalStatus(status) {
  const message = STATUS_MESSAGES[status];
  if (!message) return;

  const targets = [
    document.getElementById("predictions-list"),
    document.getElementById("top-picks-list")
  ];

  targets.forEach(el => {
    if (el) el.innerHTML = `<div class="no-data">${message}</div>`;
  });
}

/* =========================
   TOP PICKS TOGGLE
========================= */
const toggleBtn = document.getElementById("toggle-top-picks");
const topPicksContent = document.getElementById("top-picks-content");

if (toggleBtn && topPicksContent) {
  toggleBtn.addEventListener("click", () => {
    const isOpen = topPicksContent.classList.toggle("open");
    toggleBtn.textContent = isOpen ? "Hide Top Picks" : "Show Top Picks";
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
