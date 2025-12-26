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

    // Ordine SOLO per orario
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

  /* ===== FINAL SCORE ===== */
  const ft = f.score?.fulltime;
  const finalScore =
    ft && ft.home != null && ft.away != null
      ? `${ft.home} – ${ft.away}`
      : time;

  /* ===== DETAILS ===== */
  const detailsHtml = buildMatchDetails(f);

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
   MATCH DETAILS (HT / GOALS)
========================= */
function buildMatchDetails(f) {
  const ht = f.score?.halftime;
  const et = f.score?.extratime;
  const pen = f.score?.penalty;
  const events = Array.isArray(f.events)
    ? f.events.filter(e => e.type === "Goal")
    : [];

  if (!ht && !et && !pen && !events.length) return "";

  let goalsHtml = "";
  if (events.length) {
    goalsHtml = `
      <div class="match-goals">
        <strong>Goals</strong>
        ${events.map(g => `
          <div>
            ${g.time.elapsed}' – ${g.player.name}
            <span class="goal-team">(${g.team.name})</span>
          </div>
        `).join("")}
      </div>
    `;
  }

  return `
    <details class="match-details">
      <summary>Match details</summary>
      ${ht ? `<div>HT: ${ht.home}–${ht.away}</div>` : ""}
      ${et ? `<div>ET: ${et.home}–${et.away}</div>` : ""}
      ${pen ? `<div>PEN: ${pen.home}–${pen.away}</div>` : ""}
      ${goalsHtml}
    </details>
  `;
}

/* =========================
   BEST MARKETS
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
