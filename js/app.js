document.addEventListener("DOMContentLoaded", () => {
  loadTopPicks();
  loadTodayMatches();
  loadMatches();
  initBackToTop();
  loadReport();
});

/* =========================
   STATUS MESSAGES
========================= */
const STATUS_MESSAGES = {
  no_data: `Insufficient historical data.`,
  api_unavailable: `Data temporarily unavailable.`,
  api_limited: `Data update temporarily limited.`
};

/* =========================
   LOAD TOP PICKS (FINAL)
========================= */
async function loadTopPicks() {
  const container = document.getElementById("top-picks-container");
  if (!container) return;

  container.innerHTML = "";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev/top-picks");
    if (!res.ok) {
      container.innerHTML = renderTopPickPlaceholder();
      return;
    }

    const data = await res.json();
    const picks = data.top_picks || [];

    if (!picks.length) {
      container.innerHTML = renderTopPickPlaceholder();
      return;
    }

    picks.forEach(p =>
      container.insertAdjacentHTML("beforeend", renderTopPickCard(p))
    );

  } catch (err) {
    console.error("Top Picks error:", err);
    container.innerHTML = renderTopPickPlaceholder();
  }
}


/* =========================
   TOP PICK CARD
========================= */
function renderTopPickCard(pick) {
  return `
    <div class="prediction-card highlight">
      <div class="prediction-market">${pick.market}</div>
      <div class="prediction-value">${pick.value}%</div>
      <div class="prediction-meta">
        ${pick.match}
      </div>
    </div>
  `;
}

function renderTopPickPlaceholder() {
  return `
    <div class="prediction-card placeholder">
      <div class="prediction-market">No Top Picks today</div>
      <div class="prediction-value">—</div>
      <div class="prediction-meta">
        We publish Top Picks only when data is reliable.
      </div>
    </div>
  `;
}

/* =========================
   PREDICTION GROUPS (OFFICIAL)
========================= */
const PREDICTION_GROUPS = [
  {
    title: "1X2",
    items: [
      { label: "1", path: "home_win", strength: "home_win" },
      { label: "X", path: "draw", strength: "draw" },
      { label: "2", path: "away_win", strength: "away_win" }
    ]
  },
  {
    title: "Double Chance",
    items: [
      { label: "1X", path: "double_chance.1x", strength: "dc_1x" },
      { label: "X2", path: "double_chance.x2", strength: "dc_x2" },
      { label: "12", path: "double_chance.12", strength: "dc_12" }
    ]
  },
  {
    title: "Goals",
    items: [
      { label: "Over 1.5", path: "over_15", strength: "over_15" },
      { label: "Under 1.5", path: "under_15", strength: null },
      { label: "Over 2.5", path: "over_25", strength: "over_25" },
      { label: "Under 2.5", path: "under_25", strength: "under_25" }
    ]
  },
  {
    title: "Both Teams To Score",
    items: [
      { label: "Goal", path: "btts", strength: "btts" },
      { label: "No Goal", path: "no_btts", strength: "no_btts" }
    ]
  }
];

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
   MATCH CARD (DASHBOARD) – RESTORED
========================= */
function renderMatchCard(f) {
  const card = document.createElement("div");
  card.className = "match-card dashboard";

  const dateObj = new Date(f.fixture.date);
  const time = dateObj.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });

  const dateLabel = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short"
  });

  const bestMarkets = getBestMarkets(f);
  const status = f.fixture.status.short;
  const isFinished = status === "FT" || status === "AET" || status === "PEN";

const ftScore = isFinished
  ? `${f.score.fulltime.home} - ${f.score.fulltime.away}`
  : null;
  card.innerHTML = `
    <div class="match-day">TODAY · ${dateLabel}</div>
    <div class="match-league">
  <img class="league-logo" src="${f.league.logo}" alt="${f.league.name}">
  <span>${f.league.name}</span>
</div>

    <div class="match-main">
    <div class="match-row primary">
  <span class="match-time">${time}</span>
  <div class="match-teams">
    <img class="team-logo" src="${f.teams.home.logo}" alt="${f.teams.home.name}">
    <span>${f.teams.home.name}</span>

    <span class="vs">vs</span>

    <span>${f.teams.away.name}</span>
    <img class="team-logo" src="${f.teams.away.logo}" alt="${f.teams.away.name}">
  </div>
</div>

${ftScore ? `
  <div class="match-row scores">
  ${
    f.score?.halftime?.home != null
      ? `<span>HT ${f.score.halftime.home} - ${f.score.halftime.away}</span>`
      : ""
  }
  ${
    f.goals?.home != null
      ? `<span>FT ${f.goals.home} - ${f.goals.away}</span>`
      : ""
  }
</div>
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
   INLINE PREDICTIONS (TODAY)
========================= */
function renderInlinePredictions(bestMarkets) {
  if (!bestMarkets) {
    return `
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
      <div class="prediction-card"><div class="prediction-market">No data</div><div class="prediction-value">—</div></div>
    `;
  }

  return bestMarkets
    .map(m => `
      <div class="prediction-card ${m.strong ? "highlight" : ""}">
        <div class="prediction-market">${m.label}</div>
        <div class="prediction-value">${m.value}%</div>
      </div>
    `)
    .join("");
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
   BEST MARKETS (TODAY)
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
   PREDICTIONS (GROUPED – ONE ROW)
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  box.innerHTML = "";

  fixtures.forEach(match => {
    const wrapper = document.createElement("div");
    wrapper.className = "prediction-match-group";

    const time = new Date(match.fixture.date).toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit"
    });

    wrapper.innerHTML = `
      <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
      <div class="prediction-meta">${match.league.name} · ${time}</div>

      <div class="prediction-groups-row">
        ${PREDICTION_GROUPS.map(group => `
          <div class="prediction-group compact">
            <div class="prediction-group-title">${group.title}</div>
            <div class="prediction-pills">
              ${group.items.map(item =>
                renderPredictionCard(match, item)
              ).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    `;

    box.appendChild(wrapper);
  });
}

/* =========================
   SINGLE PREDICTION CARD
========================= */
function renderPredictionCard(match, item) {
  const p = match.predictions;
  const hasData = !!p;
  let value = "—";
  let highlight = false;

  if (hasData) {
    const v = getValueByPath(p, item.path);
    if (v != null) value = `${v}%`;

    if (p.strength && item.strength && p.strength[item.strength]) {
      highlight = true;
    }
  }

  return `
    <div class="prediction-card ${highlight ? "highlight" : ""}">
      <div class="prediction-market">${item.label}</div>
      <div class="prediction-value">
        ${hasData ? value : "Insufficient data"}
      </div>
    </div>
  `;
}

/* =========================
   LOAD REPORT
========================= */
async function loadReport() {
  const summaryBox = document.getElementById("report-summary");
  const listBox = document.getElementById("report-list");
  const emptyBox = document.getElementById("report-empty");

  if (!summaryBox || !listBox) return;

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev/report");
    if (!res.ok) throw new Error();

    const data = await res.json();

    if (!data.summary || data.summary.total === 0) {
      emptyBox.style.display = "block";
      summaryBox.innerHTML = "";
      listBox.innerHTML = "";
      return;
    }

    emptyBox.style.display = "none";

    // SUMMARY
    summaryBox.innerHTML = `
      <div class="stat-card"><h3>${data.summary.total}</h3><p>Total Picks</p></div>
      <div class="stat-card"><h3>${data.summary.won}</h3><p>Won</p></div>
      <div class="stat-card"><h3>${data.summary.lost}</h3><p>Lost</p></div>
      <div class="stat-card"><h3>${data.summary.accuracy}%</h3><p>Accuracy</p></div>
    `;
   renderReportCharts(data.summary);
    // PICKS
    listBox.innerHTML = "";
    data.picks.forEach(p => {
      const div = document.createElement("div");
      div.className = `report-pick ${p.result ? "win" : "loss"}`;
      div.innerHTML = `
        <div class="match">${p.match}</div>
        <div class="market">${p.market} · ${p.probability}%</div>
        <div class="result">
          FT ${p.ft} — ${p.result ? "WIN" : "LOSS"}
        </div>
      `;
      listBox.appendChild(div);
    });

  } catch {
    emptyBox.style.display = "block";
  }
}

/* =========================
   REPORT CHARTS
========================= */
function renderReportCharts(summary) {
  const ctxAccuracy = document.getElementById("accuracy-chart");
  const ctxWL = document.getElementById("wl-chart");

  if (!ctxAccuracy || !ctxWL) return;

  // Accuracy (single point now, future-ready)
  new Chart(ctxAccuracy, {
    type: "line",
    data: {
      labels: ["Today"],
      datasets: [{
        label: "Accuracy %",
        data: [summary.accuracy],
        borderColor: "#2fbf71",
        backgroundColor: "rgba(47,191,113,0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { min: 0, max: 100 }
      }
    }
  });

  // Win / Loss
  new Chart(ctxWL, {
    type: "bar",
    data: {
      labels: ["Won", "Lost"],
      datasets: [{
        data: [summary.won, summary.lost],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}
/* =========================
   REPORT SUMMARY (FILTERED)
========================= */
let accuracyChart = null;
let wlChart = null;

async function loadReportSummary(range = "7d") {
  try {
    const res = await fetch(
      `https://prebetpro-api.vincenzodiguida.workers.dev/report/summary?range=${range}`
    );
    if (!res.ok) return;

    const data = await res.json();
    renderSummaryCharts(data);
  } catch (err) {
    console.error("Report summary error", err);
  }
}

function renderSummaryCharts(data) {
  const accCtx = document.getElementById("accuracy-chart");
  const wlCtx = document.getElementById("wl-chart");

  if (!accCtx || !wlCtx) return;

  // 🔁 reset charts
  if (accuracyChart) accuracyChart.destroy();
  if (wlChart) wlChart.destroy();

  // Accuracy by day
  accuracyChart = new Chart(accCtx, {
    type: "line",
    data: {
      labels: data.by_day.map(d => d.date),
      datasets: [{
        label: "Accuracy %",
        data: data.by_day.map(d =>
          d.total ? Math.round((d.won / d.total) * 100) : 0
        ),
        borderColor: "#2fbf71",
        backgroundColor: "rgba(47,191,113,0.2)",
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { min: 0, max: 100 } }
    }
  });

  // Win / Loss
  wlChart = new Chart(wlCtx, {
    type: "bar",
    data: {
      labels: ["Won", "Lost"],
      datasets: [{
        data: [data.summary.won, data.summary.lost],
        backgroundColor: ["#22c55e", "#ef4444"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } }
    }
  });
}

/* =========================
   REPORT FILTER MENU LOGIC
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("report-range");
  if (!select) return;

  select.addEventListener("change", () => {
    const value = select.value;

    // TODAY = daily report
    if (value === "today") {
      loadReport();
      return;
    }

    // AGGREGATED
    loadReportSummary(value);
  });
});

/* =========================
   REPORT FILTER INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("report-range");
  if (!select) return;

  loadReportSummary(select.value);

  select.addEventListener("change", e => {
    loadReportSummary(e.target.value);
  });
});
/* =========================
   UTILS
========================= */
function getValueByPath(obj, path) {
  return path.split(".").reduce((o, k) => (o ? o[k] : null), obj);
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

  const el = document.getElementById("predictions-list");
  if (el) el.innerHTML = `<div class="no-data">${message}</div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  }
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
