document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  initBackToTop();
});

/* =========================
   LOAD MATCHES
========================= */
async function loadMatches() {
  const matchesBox = document.getElementById("matches");
  const noMatchesBox = document.getElementById("no-matches");
  const statsBox = document.getElementById("stats-summary");

  if (!matchesBox) return;

  matchesBox.innerHTML = "⏳ Loading matches...";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const fixtures = data.fixtures || [];

    if (fixtures.length === 0) {
      matchesBox.innerHTML = "";
      if (noMatchesBox) noMatchesBox.style.display = "block";
      if (statsBox) statsBox.innerHTML = "";
      return;
    }

    if (noMatchesBox) noMatchesBox.style.display = "none";
    matchesBox.innerHTML = "";

    renderStatistics(fixtures);
    renderPredictions(fixtures);

    fixtures.forEach(match => {
      const card = document.createElement("div");
      card.className = "match-card";

      const league = match.league?.name || "ND";
      const logo = match.league?.logo || "";
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const status = match.fixture.status.short;
      const finished = ["FT", "AET", "PEN"].includes(status);

      const score = finished
        ? `${match.goals.home} – ${match.goals.away}`
        : new Date(match.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
          });

      card.innerHTML = `
        <div class="match-league">
          ${logo ? `<img src="${logo}" width="18">` : ""}
          ${league}
        </div>

        <div class="match-teams">
          ${home} <strong>vs</strong> ${away}
        </div>

        <div class="match-info">
          <span>${score}</span>
          <strong>${status}</strong>
        </div>
      `;

      matchesBox.appendChild(card);
    });

  } catch (err) {
    console.error("loadMatches error:", err);
    matchesBox.innerHTML = `
      <div class="no-data">
        Data temporarily unavailable.
      </div>
    `;
  }
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
   PREDICTIONS (REAL DATA)
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

    // ❌ Storico insufficiente
    if (match.confidence !== "high" || !match.predictions) {
      card.innerHTML = `
        <div class="prediction-header">
          ${home} vs ${away}
        </div>
        <div class="prediction-info">
          <strong>📊 Previsioni non disponibili</strong>
          <p>
            Storico insufficiente per questa partita.<br>
            Il modello statistico si attiva solo con dati adeguati.
          </p>
        </div>
      `;
      box.appendChild(card);
      return;
    }

    // ✅ Dati reali dal backend
    const p = match.predictions;
    const dc = p.double_chance;
    const hi = v => v >= 70 ? "highlight" : "";

    card.innerHTML = `
      <div class="prediction-header">
        ${home} vs ${away}
      </div>

      <div class="prediction-section-title">1X2</div>
      <div class="prediction-grid grid-3">
        <div class="prediction-item ${hi(p.home_win)}">1 <strong>${p.home_win}%</strong></div>
        <div class="prediction-item ${hi(p.draw)}">X <strong>${p.draw}%</strong></div>
        <div class="prediction-item ${hi(p.away_win)}">2 <strong>${p.away_win}%</strong></div>
      </div>

      <div class="prediction-section-title">Doppia Chance</div>
      <div class="prediction-grid grid-3">
        <div class="prediction-item ${hi(dc["1x"])}">1X <strong>${dc["1x"]}%</strong></div>
        <div class="prediction-item ${hi(dc["x2"])}">X2 <strong>${dc["x2"]}%</strong></div>
        <div class="prediction-item ${hi(dc["12"])}">12 <strong>${dc["12"]}%</strong></div>
      </div>

      <div class="prediction-section-title">Over / Under</div>
      <div class="prediction-grid grid-3">
        <div class="prediction-item ${hi(p.over_15)}">Over 1.5 <strong>${p.over_15}%</strong></div>
        <div class="prediction-item ${hi(p.under_15)}">Under 1.5 <strong>${p.under_15}%</strong></div>
        <div class="prediction-item ${hi(p.over_25)}">Over 2.5 <strong>${p.over_25}%</strong></div>
        <div class="prediction-item ${hi(p.under_25)}">Under 2.5 <strong>${p.under_25}%</strong></div>
      </div>

      <div class="prediction-section-title">Goal / No Goal</div>
      <div class="prediction-grid grid-3">
        <div class="prediction-item ${hi(p.btts)}">Goal <strong>${p.btts}%</strong></div>
        <div class="prediction-item ${hi(p.no_btts)}">No Goal <strong>${p.no_btts}%</strong></div>
      </div>
    `;

    box.appendChild(card);
  });
}
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
   TODAY – RENDER MATCHES
========================= */

async function loadTodayMatches() {
  const container = document.getElementById("matches");
  const noMatches = document.getElementById("no-matches");

  if (!container) return;

  try {
    const res = await fetch("/");
    const data = await res.json();
    const fixtures = data.fixtures || [];

    if (!fixtures.length) {
      noMatches.style.display = "block";
      return;
    }

    // Group by confidence
    const groups = {
      high: [],
      medium: [],
      low: []
    };

    fixtures.forEach(f => {
      if (!f.confidence) return;
      groups[f.confidence].push(f);
    });

    // Sort each group by kick-off time
    Object.values(groups).forEach(group => {
      group.sort((a, b) =>
        new Date(a.fixture.date) - new Date(b.fixture.date)
      );
    });

    container.innerHTML = "";

    // Message if no strong opportunities
    if (!groups.high.length && !groups.medium.length) {
      const msg = document.createElement("div");
      msg.className = "no-data";
      msg.innerHTML = `
        Today’s matches show low statistical confidence.<br>
        No strong opportunities detected.
      `;
      container.appendChild(msg);
    }

    // Render groups in order
    ["high", "medium", "low"].forEach(level => {
      groups[level].forEach(f => {
        container.appendChild(renderMatchCard(f, level));
      });
    });

  } catch (err) {
    console.error("Failed to load today matches", err);
  }
}

/* =========================
   MATCH CARD RENDER
========================= */

function renderMatchCard(fixture, level) {
  const card = document.createElement("div");
  card.className = `match-card confidence-${level}`;

  const kickoff = new Date(fixture.fixture.date)
    .toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

  const isLow = level === "low";
  if (isLow) card.classList.add("collapsed");

  card.innerHTML = `
    <div class="match-header">
      <div>
        <div class="match-teams">
          ${fixture.teams.home.name} vs ${fixture.teams.away.name}
        </div>
        <div class="match-league">
          ${fixture.league.name} · ${kickoff}
        </div>
      </div>
      <span class="confidence-badge confidence-${level}">
        ${level.toUpperCase()}
      </span>
    </div>

    ${isLow ? `<button class="toggle-details">Show details</button>` : ""}

    <div class="prediction-grid">
      ${renderMarkets(fixture)}
    </div>
  `;

  // Toggle LOW confidence
  if (isLow) {
    const btn = card.querySelector(".toggle-details");
    btn.addEventListener("click", () => {
      card.classList.toggle("collapsed");
      btn.textContent = card.classList.contains("collapsed")
        ? "Show details"
        : "Hide details";
    });
  }

  return card;
}

/* =========================
   MARKETS RENDER
========================= */

function renderMarkets(f) {
  const p = f.predictions;
  if (!p) return "";

  const s = p.strength || {};

  const markets = [
    { label: "1", value: p.home_win, strong: s.home_win },
    { label: "X", value: p.draw, strong: s.draw },
    { label: "2", value: p.away_win, strong: s.away_win },
    { label: "Under 2.5", value: p.under_25, strong: s.under_25 },
    { label: "Over 2.5", value: p.over_25, strong: s.over_25 },
    { label: "Goal", value: p.btts, strong: s.btts },
    { label: "No Goal", value: p.no_btts, strong: s.no_btts }
  ];

  return markets
    .filter(m => m.value !== undefined)
    .map(m => `
      <div class="prediction-item ${m.strong ? "highlight" : ""}">
        ${m.label}
        <strong>${m.value}%</strong>
      </div>
    `)
    .join("");
}

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  loadTodayMatches();
});

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
