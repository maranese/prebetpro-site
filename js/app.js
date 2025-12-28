document.addEventListener("DOMContentLoaded", () => {
  loadTodayMatches();
  loadMatches();
  initBackToTop();
});

/* =========================
   LOAD MATCHES
========================= */
async function loadMatches() {
  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) return;

    const data = await res.json();
    renderPredictions(data.fixtures || []);
  } catch (e) {
    console.error(e);
  }
}

/* =========================
   LOAD TODAY MATCHES
========================= */
async function loadTodayMatches() {
  const container = document.getElementById("matches");
  if (!container) return;

  container.innerHTML = "";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) return;

    const data = await res.json();
    (data.fixtures || [])
      .sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date))
      .forEach(f => container.appendChild(renderMatchCard(f)));

  } catch (e) {
    console.error(e);
  }
}

/* =========================
   MATCH CARD
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
        <div class="match-teams">${f.teams.home.name} vs ${f.teams.away.name}</div>
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
   INLINE PREDICTIONS
========================= */
function renderInlinePredictions(markets) {
  if (!markets) {
    return `
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
    `;
  }

  return markets.map(m => `
    <div class="prediction-card ${m.strong ? "highlight" : ""}">
      <div class="prediction-market">${m.label}</div>
      <div class="prediction-value">${m.value}%</div>
    </div>
  `).join("");
}

/* =========================
   BEST MARKETS
========================= */
function getBestMarkets(f) {
  if (!f.predictions || !f.predictions.strength) return null;

  const p = f.predictions;
  const s = p.strength;

  return [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 }
  ]
    .filter(m => m.value >= 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/* =========================
   PREDICTIONS
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  box.innerHTML = "";

  fixtures.forEach(f => {
    const card = document.createElement("div");
    card.className = "prediction-card";

    card.innerHTML = `
      <div class="prediction-market">${f.teams.home.name} vs ${f.teams.away.name}</div>
      <div class="prediction-value">—</div>
    `;

    box.appendChild(card);
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

  btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}
