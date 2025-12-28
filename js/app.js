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
    <strong>Insufficient historical data.</strong><br>
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
   PREDICTIONS SECTION
========================= */
function renderPredictions(fixtures) {
  const container = document.getElementById("predictions-list");
  if (!container) return;

  container.innerHTML = "";

  fixtures.forEach(match => {
    const group = document.createElement("div");
    group.className = "prediction-match-group";

    const title = document.createElement("h3");
    title.textContent = `${match.teams.home.name} vs ${match.teams.away.name}`;
    group.appendChild(title);

    // ❌ No reliable predictions
    if (match.confidence !== "high" || !match.predictions) {
      const msg = document.createElement("div");
      msg.className = "no-data";
      msg.innerHTML = STATUS_MESSAGES.no_data;
      group.appendChild(msg);
      container.appendChild(group);
      return;
    }

    // ✅ Predictions available
    const grid = document.createElement("div");
    grid.className = "predictions-grid";

    const p = match.predictions;

    const markets = [
      { label: "1", value: p.home_win },
      { label: "X", value: p.draw },
      { label: "2", value: p.away_win },
      { label: "1X", value: p.double_chance_1x },
      { label: "X2", value: p.double_chance_x2 },
      { label: "12", value: p.double_chance_12 },
      { label: "Over 1.5", value: p.over_15 },
      { label: "Under 1.5", value: p.under_15 },
      { label: "Over 2.5", value: p.over_25 },
      { label: "Under 2.5", value: p.under_25 },
      { label: "Goal", value: p.btts },
      { label: "No Goal", value: p.no_btts }
    ];

    markets
      .filter(m => m.value != null)
      .forEach(m => {
        const card = document.createElement("div");
        card.className = "prediction-card";

        card.innerHTML = `
          <div class="prediction-market">${m.label}</div>
          <div class="prediction-value">${m.value}%</div>
        `;

        grid.appendChild(card);
      });

    group.appendChild(grid);
    container.appendChild(group);
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
   GLOBAL STATUS
========================= */
function renderGlobalStatus(status) {
  const message = STATUS_MESSAGES[status];
  if (!message) return;

  const target = document.getElementById("predictions-list");
  if (target) {
    target.innerHTML = `<div class="no-data">${message}</div>`;
  }
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
