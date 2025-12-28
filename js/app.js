document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadTodayMatches();
  initBackToTop();
});

/* =========================
   LOAD MATCHES
========================= */
async function loadMatches() {
  const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
  if (!res.ok) return;

  const data = await res.json();
  const fixtures = data.fixtures || [];

  renderTopPicks(fixtures);
  renderPredictions(fixtures);
}

/* =========================
   TOP PICKS
========================= */
function renderTopPicks(fixtures) {
  const box = document.getElementById("top-picks-list");
  if (!box) return;

  box.innerHTML = "";
  const picks = [];

  fixtures.forEach(f => {
    if (f.confidence !== "high" || !f.predictions?.strength) return;
    const p = f.predictions;
    const s = p.strength;

    [
      { label: "1", value: p.home_win, strong: s.home_win },
      { label: "X", value: p.draw, strong: s.draw },
      { label: "2", value: p.away_win, strong: s.away_win },
      { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
      { label: "Under 2.5", value: p.under_25, strong: s.under_25 }
    ].forEach(m => {
      if (m.strong && m.value != null) picks.push(m);
    });
  });

  picks.sort((a, b) => b.value - a.value);

  if (!picks.length) {
    box.innerHTML = `
      ${[1,2,3].map(() => `
        <div class="prediction-card placeholder">
          <div class="tp-day">Today</div>
          <div class="tp-empty">No Top Picks</div>
        </div>
      `).join("")}
    `;
    return;
  }

  picks.forEach(p => {
    box.innerHTML += `
      <div class="prediction-card highlight">
        <div class="prediction-market">${p.label}</div>
        <div class="prediction-value">${p.value}%</div>
      </div>
    `;
  });
}

/* =========================
   MATCHES
========================= */
async function loadTodayMatches() {
  const container = document.getElementById("matches");
  if (!container) return;

  const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
  if (!res.ok) return;

  const data = await res.json();
  const fixtures = data.fixtures || [];

  container.innerHTML = "";

  fixtures.forEach(f => {
    container.appendChild(renderMatchCard(f));
  });
}

function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = "match-card";

  const date = new Date(f.fixture.date);
  const time = date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  card.innerHTML = `
    <div class="match-date">TODAY · ${day}</div>
    <div class="match-league">${f.league.name}</div>

    <div class="match-grid">
      <div>
        <div class="match-title">${time} ${f.teams.home.name} vs ${f.teams.away.name}</div>
        <div class="show-details">Show details ▾</div>
      </div>

      <div class="match-predictions">
        ${renderPredictionSlot()}
        ${renderPredictionSlot()}
        ${renderPredictionSlot()}
      </div>
    </div>
  `;
  return card;
}

function renderPredictionSlot() {
  return `
    <div class="prediction-card placeholder">
      <div class="prediction-market">No data</div>
      <div class="prediction-value">—</div>
    </div>
  `;
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
    card.className = "prediction-card placeholder";
    card.innerHTML = `
      <div class="prediction-market">${f.teams.home.name} vs ${f.teams.away.name}</div>
      <div class="prediction-value">No data</div>
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
