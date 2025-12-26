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
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const fixtures = data.fixtures || [];

    renderStatistics(fixtures);
    renderPredictions(fixtures);

  } catch (err) {
    console.error("loadMatches error:", err);
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
    const data = await res.json();
    const fixtures = data.fixtures || [];

    if (!fixtures.length) {
      noMatches.style.display = "block";
      return;
    }

    noMatches.style.display = "none";

    // 🔹 ORDINE PER ORARIO DI INIZIO
    fixtures.sort(
      (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
    );

    fixtures.forEach(f => {
      container.appendChild(renderMatchCard(f));
    });

  } catch (err) {
    console.error(err);
    noMatches.style.display = "block";
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

  /* ===== RESULT HANDLING ===== */
  const status = f.fixture.status.short;
  const ft = f.score?.fulltime;

  const finalScore =
    ft && (ft.home != null && ft.away != null)
      ? `${ft.home} – ${ft.away}`
      : time;

  /* ===== OPTIONAL DETAILS ===== */
  const ht = f.score?.halftime;
  const et = f.score?.extratime;
  const pen = f.score?.penalty;

  let detailsHtml = "";

  if (ht || et || pen) {
    detailsHtml = `
      <details class="match-details">
        <summary>Match details</summary>
        ${ht ? `<div>HT: ${ht.home}–${ht.away}</div>` : ""}
        ${et ? `<div>ET: ${et.home}–${et.away}</div>` : ""}
        ${pen ? `<div>PEN: ${pen.home}–${pen.away}</div>` : ""}
      </details>
    `;
  }

  /* ===== BEST 3 MARKETS ===== */
  const bestMarkets = getBestMarkets(f);

  card.innerHTML = `
    <div class="match-header">
      <div>
        <div class="match-teams">
          ${f.teams.home.name} vs ${f.teams.away.name}
        </div>
        <div class="match-league">
          ${f.league.name} · ${time}
        </div>
      </div>

      <span class="confidence-badge confidence-${f.confidence}">
        ${f.confidence.toUpperCase()}
      </span>
    </div>

    <div class="match-info">
      <strong>${finalScore}</strong>
    </div>

    ${detailsHtml}

    <div class="prediction-grid">
      ${bestMarkets.map(m => renderMarket(m.label, m.value, m.strong)).join("")}

      <div class="prediction-item view-all"
           onclick="location.href='#predictions'">
        Show all →
      </div>
    </div>
  `;

  return card;
}

/* =========================
   BEST MARKETS SELECTOR
========================= */
function getBestMarkets(f) {
  if (!f.predictions || !f.predictions.strength) return [];

  const p = f.predictions;
  const s = p.strength;

  const markets = [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Goal", value: p.btts, strong: s.btts },
    { label: "No Goal", value: p.no_btts, strong: s.no_btts }
  ].filter(m => m.value != null);

  markets.sort((a, b) => b.value - a.value);
  return markets.slice(0, 3);
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
   PREDICTIONS (FULL PAGE)
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  const empty = document.getElementById("predictions-empty");
  if (!box) return;

  box.innerHTML = "";
  if (empty) empty.style.display = "none";

  fixtures.forEach(match => {
    const card = document.createElement("div");
    card.className = "prediction-card";

    const home = match.teams.home.name;
    const away = match.teams.away.name;

    if (match.confidence !== "high" || !match.predictions) {
      card.innerHTML = `
        <div class="prediction-header">${home} vs ${away}</div>
        <div class="prediction-info">
          <strong>📊 Predictions not available</strong>
          <p>
            Insufficient historical data.<br>
            The model activates only with adequate samples.
          </p>
        </div>
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
   TOP PICKS TOGGLE
========================= */
const toggleBtn = document.getElementById("toggle-top-picks");
const topPicksContent = document.getElementById("top-picks-content");

if (toggleBtn && topPicksContent) {
  toggleBtn.addEventListener("click", () => {
    const isOpen = topPicksContent.classList.toggle("open");
    toggleBtn.textContent = isOpen
      ? "Hide Top Picks"
      : "Show Top Picks";
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
