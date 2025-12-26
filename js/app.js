document.addEventListener("DOMContentLoaded", () => {
  renderTodayHeader();
  loadTodayMatches();
  loadMatches();
  initBackToTop();
});

/* =========================
   TODAY HEADER (DATE)
========================= */
function renderTodayHeader() {
  const todaySection = document.getElementById("today");
  if (!todaySection) return;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const header = document.createElement("div");
  header.className = "today-header";
  header.innerHTML = `📅 Today · ${today}`;

  todaySection.insertBefore(header, todaySection.children[1]);
}

/* =========================
   LOAD MATCHES (API ROOT)
========================= */
async function loadMatches() {
  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    const data = await res.json();
    const fixtures = data.fixtures || [];

    renderStatistics(fixtures);
    renderPredictions(fixtures);

  } catch (err) {
    console.error(err);
  }
}

/* =========================
   LOAD TODAY MATCHES
========================= */
async function loadTodayMatches() {
  const container = document.getElementById("matches");
  const noMatches = document.getElementById("no-matches");
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

    // ordine per orario
    fixtures.sort((a, b) =>
      new Date(a.fixture.date) - new Date(b.fixture.date)
    );

    // 🔹 GROUP BY LEAGUE
    const leagues = {};
    fixtures.forEach(f => {
      const league = f.league.name;
      if (!leagues[league]) leagues[league] = [];
      leagues[league].push(f);
    });

    Object.entries(leagues).forEach(([league, matches]) => {
      container.appendChild(renderLeagueBlock(league, matches));
    });

  } catch (err) {
    console.error(err);
    noMatches.style.display = "block";
  }
}

/* =========================
   LEAGUE BLOCK
========================= */
function renderLeagueBlock(leagueName, matches) {
  const block = document.createElement("div");
  block.className = "league-block";

  const header = document.createElement("div");
  header.className = "league-header";
  header.innerHTML = `
    <span>${leagueName}</span>
    <button class="league-toggle">Hide</button>
  `;

  const list = document.createElement("div");
  list.className = "league-matches";

  matches.forEach(m => list.appendChild(renderMatchCard(m)));

  header.querySelector("button").onclick = () => {
    const hidden = list.classList.toggle("hidden");
    header.querySelector("button").textContent =
      hidden ? "Show" : "Hide";
  };

  block.appendChild(header);
  block.appendChild(list);
  return block;
}

/* =========================
   MATCH CARD
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = `match-card confidence-${f.confidence}`;

  const dt = new Date(f.fixture.date);
  const time = dt.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });
  const date = dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });

  const status = f.fixture.status.short;
  const ft = f.score?.fulltime;

  const finalScore =
    ft && ft.home != null
      ? `<span class="ft-label">${status}</span> ${ft.home} – ${ft.away}`
      : `${date} · ${time}`;

  const details = buildMatchDetails(f);
  const markets = getBestMarkets(f);

  card.innerHTML = `
    <div class="match-header">
      <div>
        <div class="match-teams">${f.teams.home.name} vs ${f.teams.away.name}</div>
        <div class="match-meta">${date} · ${time}</div>
      </div>
      <span class="confidence-badge confidence-${f.confidence}">
        ${f.confidence.toUpperCase()}
      </span>
    </div>

    <div class="match-score">${finalScore}</div>

    ${details}

    <div class="prediction-grid">
      ${markets.map(m => renderMarket(m.label, m.value, m.strong)).join("")}
      <div class="prediction-item view-all"
           onclick="location.href='#predictions'">
        Show all →
      </div>
    </div>
  `;

  return card;
}

/* =========================
   MATCH DETAILS + GOALS
========================= */
function buildMatchDetails(f) {
  const ht = f.score?.halftime;
  const et = f.score?.extratime;
  const pen = f.score?.penalty;
  const goals = (f.events || []).filter(e => e.type === "Goal");

  if (!ht && !et && !pen && !goals.length) return "";

  return `
    <details class="match-details">
      <summary>Match details</summary>
      ${ht ? `<div>HT: ${ht.home}–${ht.away}</div>` : ""}
      ${et ? `<div>ET: ${et.home}–${et.away}</div>` : ""}
      ${pen ? `<div>PEN: ${pen.home}–${pen.away}</div>` : ""}
      ${goals.map(g => `
        <div>
          ${g.time.elapsed}' ${g.player.name}
          <span class="goal-team">(${g.team.name})</span>
        </div>
      `).join("")}
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

  return [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 }
  ]
    .filter(m => m.value != null)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
}

/* =========================
   MARKET
========================= */
function renderMarket(label, value, strong) {
  return `
    <div class="prediction-item ${strong ? "highlight" : ""}">
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
