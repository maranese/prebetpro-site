document.addEventListener("DOMContentLoaded", () => {
  loadTodayMatches();
  loadMatches();
  initBackToTop();
});

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
    const status = data.status || "ok";
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
   MATCH CARD (TODAY)
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = `match-card confidence-${f.confidence}`;

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
  if (ht?.home != null) scoreHtml += `<div>HT: ${ht.home}–${ht.away}</div>`;
  if (ft?.home != null) scoreHtml += `<div>FT: ${ft.home}–${ft.away}</div>`;
  if (status === "AET" && et) scoreHtml += `<div>AET: ${et.home}–${et.away}</div>`;
  if (status === "PEN" && pen) scoreHtml += `<div>PEN: ${pen.home}–${pen.away}</div>`;

  const bestMarkets = getBestMarkets(f);

  card.innerHTML = `
    <div class="match-header">
      <div>
        <div class="match-teams">
          <img src="${f.teams.home.logo}" alt="${f.teams.home.name}" class="team-logo" />
          ${f.teams.home.name} vs ${f.teams.away.name}
          <img src="${f.teams.away.logo}" alt="${f.teams.away.name}" class="team-logo" />
        </div>
        <div class="match-league">${f.league.name} · ${time}</div>
      </div>
      <span class="confidence-badge confidence-${f.confidence}">
        ${formatConfidence(f.confidence)}
      </span>
    </div>

    <div class="match-info">${scoreHtml}</div>

    <div class="prediction-grid">
      ${bestMarkets.map(m => renderMarket(m.label, m.value, m.strong)).join("")}
      <div class="prediction-item view-all" onclick="location.href='#predictions'">
        Show all
      </div>
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
    .filter(m => m.value != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/* =========================
   MARKET RENDER
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
