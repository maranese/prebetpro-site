/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  initBackToTop();
  initTopPicksToggle();
});

/* =========================
   FETCH DATA (ONCE)
========================= */
async function loadData() {
  const matchesBox = document.getElementById("matches");
  const noMatchesBox = document.getElementById("no-matches");

  if (matchesBox) matchesBox.innerHTML = "⏳ Loading matches...";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const fixtures = data.fixtures || [];

    if (!fixtures.length) {
      if (matchesBox) matchesBox.innerHTML = "";
      if (noMatchesBox) noMatchesBox.style.display = "block";
      return;
    }

    if (noMatchesBox) noMatchesBox.style.display = "none";

    // Ordine per DATA + ORA di inizio
    fixtures.sort(
      (a, b) => new Date(a.fixture.date) - new Date(b.fixture.date)
    );

    renderToday(fixtures);
    renderPredictions(fixtures);
    renderStatistics(fixtures);

  } catch (err) {
    console.error("API error:", err);
    if (matchesBox) {
      matchesBox.innerHTML = `
        <div class="no-data">
          Data temporarily unavailable.
        </div>
      `;
    }
  }
}

/* =========================
   TODAY
========================= */
function renderToday(fixtures) {
  const container = document.getElementById("matches");
  if (!container) return;

  container.innerHTML = "";

  fixtures.forEach(f => {
    container.appendChild(renderMatchCard(f));
  });
}

/* =========================
   MATCH CARD (TODAY)
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = `match-card confidence-${f.confidence}`;

  const kickoff = new Date(f.fixture.date);
  const dateStr = kickoff.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
  const timeStr = kickoff.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  // STATUS & SCORES
  const status = f.fixture.status.short;
  const ht = f.score?.halftime;
  const ft = f.score?.fulltime;
  const et = f.score?.extratime;
  const pen = f.score?.penalty;

  let scoreHtml = "";
  if (ht && ht.home != null) scoreHtml += `<div>HT: ${ht.home}–${ht.away}</div>`;
  if (ft && ft.home != null) scoreHtml += `<div>FT: ${ft.home}–${ft.away}</div>`;
  if (status === "AET" && et) scoreHtml += `<div>AET: ${et.home}–${et.away}</div>`;
  if (status === "PEN" && pen) scoreHtml += `<div>PEN: ${pen.home}–${pen.away}</div>`;

  // 1X2 predictions
  const p = f.predictions;
  const s = p?.strength || {};

  card.innerHTML = `
    <div class="match-header">
      <div>
        <div class="match-teams">
          ${f.teams.home.name} vs ${f.teams.away.name}
        </div>
        <div class="match-league">
          ${f.league.name} · ${dateStr} ${timeStr}
        </div>
      </div>
      <span class="confidence-badge confidence-${f.confidence}">
        ${f.confidence.toUpperCase()}
      </span>
    </div>

    <div class="match-info">
      ${scoreHtml}
    </div>

    <div class="prediction-grid">
      ${renderMarket("1", p?.home_win, s.home_win)}
      ${renderMarket("X", p?.draw, s.draw)}
      ${renderMarket("2", p?.away_win, s.away_win)}
    </div>

    <button class="view-more" onclick="location.href='#predictions'">
      View full predictions
    </button>
  `;

  return card;
}

/* =========================
   PREDICTIONS (FULL)
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  const empty = document.getElementById("predictions-empty");
  if (!box) return;

  box.innerHTML = "";
  if (empty) empty.style.display = "none";

  fixtures.forEach(f => {
    const card = document.createElement("div");
    card.className = "prediction-card";

    const kickoff = new Date(f.fixture.date);
    const dateStr = kickoff.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "short"
    });
    const timeStr = kickoff.toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });

    if (f.confidence !== "high" || !f.predictions) {
      card.innerHTML = `
        <div class="prediction-header">
          ${f.teams.home.name} vs ${f.teams.away.name}
          <span class="confidence-badge confidence-${f.confidence}">
            ${f.confidence.toUpperCase()}
          </span>
        </div>
        <div class="prediction-info">
          <strong>📊 Predictions unavailable</strong>
          <p>Insufficient historical data for this match.</p>
        </div>
      `;
      box.appendChild(card);
      return;
    }

    const p = f.predictions;
    const s = p.strength;

    card.innerHTML = `
      <div class="prediction-header">
        <div>
          ${f.teams.home.name} vs ${f.teams.away.name}<br>
          <small>${dateStr} ${timeStr}</small>
        </div>
        <span class="confidence-badge confidence-high">HIGH</span>
      </div>

      <div class="prediction-grid">
        ${renderMarket("1", p.home_win, s.home_win)}
        ${renderMarket("X", p.draw, s.draw)}
        ${renderMarket("2", p.away_win, s.away_win)}
        ${renderMarket("1X", p.double_chance["1x"], s.dc_1x)}
        ${renderMarket("X2", p.double_chance["x2"], s.dc_x2)}
        ${renderMarket("12", p.double_chance["12"], s.dc_12)}
        ${renderMarket("Under 2.5", p.under_25, s.under_25)}
        ${renderMarket("Over 2.5", p.over_25, s.over_25)}
        ${renderMarket("Goal", p.btts, s.btts)}
        ${renderMarket("No Goal", p.no_btts, s.no_btts)}
      </div>
    `;

    box.appendChild(card);
  });
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
   HELPERS
========================= */
function renderMarket(label, value, strong) {
  if (value == null) return "";
  return `
    <div class="prediction-item ${strong ? "highlight" : ""}">
      ${label}
      <strong>${value}%</strong>
    </div>
  `;
}

/* =========================
   TOP PICKS TOGGLE
========================= */
function initTopPicksToggle() {
  const toggleBtn = document.getElementById("toggle-top-picks");
  const content = document.getElementById("top-picks-content");

  if (!toggleBtn || !content) return;

  toggleBtn.addEventListener("click", () => {
    const open = content.classList.toggle("open");
    toggleBtn.textContent = open ? "Hide Top Picks" : "Show Top Picks";
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
