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
   PREDICTIONS – OPZIONE C
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

    const p = match.predictions;
    const hi = v => v >= 70 ? "prediction-high" : "";

    // 🔥 RACCOLTA MERCATI + RANKING
    const markets = [
      { label: "1", value: p.home_win },
      { label: "X", value: p.draw },
      { label: "2", value: p.away_win },

      { label: "1X", value: p.dc_1x },
      { label: "X2", value: p.dc_x2 },
      { label: "12", value: p.dc_12 },

      { label: "Over 1.5", value: p.over_15 },
      { label: "Over 2.5", value: p.over_25 },
      { label: "Under 2.5", value: p.under_25 },

      { label: "Goal", value: p.btts },
      { label: "No Goal", value: p.no_btts },
    ];

    const ranked = markets
      .filter(m => m.value >= 70)
      .sort((a, b) => b.value - a.value);

    const best = ranked[0];

    const rankedHTML = ranked.length
      ? ranked.map(m => `
          <div class="prediction-row prediction-high">
            ${m.label}
            <strong>${m.value}%</strong>
          </div>
        `).join("")
      : `<p>Nessuna previsione sopra il 70%</p>`;

    card.innerHTML = `
      <div class="prediction-header">
        ${home} vs ${away}
      </div>

      ${best ? `
        <div class="best-pick">
          ⭐ BEST PICK: <strong>${best.label}</strong> (${best.value}%)
        </div>
      ` : ""}

      <div class="prediction-grid">
        ${rankedHTML}
      </div>
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

  btn.onclick = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });
}
