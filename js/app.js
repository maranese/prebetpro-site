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
  api_limited: `Data update temporarily limited.`
};

/* =========================
   LOAD MATCHES
========================= */
async function loadMatches() {
  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) {
      renderGlobalStatus("api_unavailable");
      return;
    }

    const data = await res.json();
    renderStatistics(data.fixtures || []);
    renderPredictions(data.fixtures || []);

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
   MATCH CARD
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = "match-card dashboard";

  const dateObj = new Date(f.fixture.date);
  const time = dateObj.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const dateLabel = dateObj.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });

  const scoresHtml = buildScoresRow(f.score, f.fixture.status.short);
  const bestMarkets = getBestMarkets(f);

  card.innerHTML = `
    <div class="match-day">TODAY · ${dateLabel}</div>
    <div class="match-league">${f.league.name}</div>

    <div class="match-main">
      <div class="match-row primary">
        <span class="match-time">${time}</span>
        <span class="match-teams">${f.teams.home.name} vs ${f.teams.away.name}</span>
      </div>

      ${scoresHtml}

      <button class="match-toggle">Show details ⌄</button>
      <div class="match-details">
        ${f.fixture.venue?.name ? `🏟 ${f.fixture.venue.name}` : ""}
      </div>
    </div>

    ${renderInlinePredictions(bestMarkets)}
  `;

  const toggle = card.querySelector(".match-toggle");
  const details = card.querySelector(".match-details");

  toggle.addEventListener("click", () => {
    details.classList.toggle("open");
    toggle.textContent = details.classList.contains("open")
      ? "Hide details ^"
      : "Show details ⌄";
  });

  return card;
}

/* =========================
   SCORE ROW
========================= */
function buildScoresRow(score, status) {
  if (!score) return "";

  const rows = [];

  if (score.halftime?.home != null) {
    rows.push(`HT ${score.halftime.home}–${score.halftime.away}`);
  }

  if (score.fulltime?.home != null) {
    rows.push(`FT ${score.fulltime.home}–${score.fulltime.away}`);
  }

  if (status === "AET" && score.extratime?.home != null) {
    rows.push(`ET ${score.extratime.home}–${score.extratime.away}`);
  }

  if (status === "PEN" && score.penalty?.home != null) {
    rows.push(`PEN ${score.penalty.home}–${score.penalty.away}`);
  }

  if (!rows.length) return "";

  return `
    <div class="match-row scores">
      ${rows.map(r => `<span>${r}</span>`).join("")}
    </div>
  `;
}

/* =========================
   INLINE PREDICTIONS
========================= */
function renderInlinePredictions(bestMarkets) {
  if (!bestMarkets) {
    return `
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
    `;
  }

  return bestMarkets.map(m => `
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
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 }
  ]
    .filter(m => m.value != null && m.value >= 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
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
   GLOBAL STATUS
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
