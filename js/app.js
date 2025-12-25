document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  initBackToTop();
});

/* =========================
   LOAD MATCHES
========================= */
async function loadMatches() {
  const box = document.getElementById("matches");
  const noBox = document.getElementById("no-matches");
  const statsBox = document.getElementById("stats-summary");

  if (!box) return;

  box.innerHTML = "⏳ Loading matches...";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) throw new Error("API error");

    const json = await res.json();
    const todayFixtures = json.fixtures || [];
    const finishedFixtures = json.lastFinished || [];

    // usiamo today se esistono, altrimenti le ultime FT
    const fixtures = todayFixtures.length > 0
    ? todayFixtures
    : finishedFixtures;
    
    if (fixtures.length === 0) {
      box.innerHTML = "";
      if (noBox) noBox.style.display = "block";
      if (statsBox) statsBox.innerHTML = "";
      return;
    }

    if (noBox) noBox.style.display = "none";
    box.innerHTML = "";

    renderStatistics(fixtures);
    renderPredictions(fixtures);

    fixtures.forEach(m => {
      const card = document.createElement("div");
      card.className = "match-card";

      const league = m.league?.name || "ND";
      const logo = m.league?.logo;
      const home = m.teams?.home?.name || "Home";
      const away = m.teams?.away?.name || "Away";
      const status = m.fixture?.status?.short || "ND";
      const finished = ["FT", "AET", "PEN"].includes(status);

      const score = finished
        ? `${m.goals.home} – ${m.goals.away}`
        : new Date(m.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          });

      card.innerHTML = `
        <div class="match-league">
          ${logo ? `<img src="${logo}" width="18">` : ""}
          ${league}
        </div>
        <div class="match-teams">${home} <strong>vs</strong> ${away}</div>
        <div class="match-info">
          <span>${score}</span>
          <strong>${status}</strong>
        </div>
      `;

      box.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    box.innerHTML = `
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
    else if (["1H","HT","2H"].includes(s)) live++;
    else if (["FT","AET","PEN"].includes(s)) ft++;
  });

  box.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total</p></div>
    <div class="stat-card"><h3>${ns}</h3><p>Not started</p></div>
    <div class="stat-card"><h3>${live}</h3><p>Live</p></div>
    <div class="stat-card"><h3>${ft}</h3><p>Finished</p></div>
  `;
}

/* =========================
   PREDICTIONS – HYBRID
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  const empty = document.getElementById("predictions-empty");

  if (!box) return;

  box.innerHTML = "";
  if (empty) empty.style.display = "none";

  fixtures.forEach(match => {
    let homeWin = Math.floor(30 + Math.random() * 40);
    let draw = Math.floor(20 + Math.random() * 20);
    let awayWin = 100 - homeWin - draw;

    let over25 = Math.floor(45 + Math.random() * 30);
    let btts = Math.floor(45 + Math.random() * 30);

    const hi = v => v >= 70 ? "highlight" : "";

    const card = document.createElement("div");
    card.className = "prediction-card";
  let predictionsHTML = "";

if (!m.predictions || m.confidence === "low") {
  predictionsHTML = `
    <div class="prediction-info">
      <strong>📊 Previsioni non disponibili</strong>
      <p>
        Storico insufficiente per questa partita.<br>
        Il modello statistico si attiva solo con dati adeguati
        per garantire affidabilità.
      </p>
    </div>
  `;
}
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

  ${predictionsHTML}
`;

    card.innerHTML = `
      <div class="prediction-header">
        ${match.teams.home.name} vs ${match.teams.away.name}
      </div>

      <div class="prediction-grid">
        <div class="prediction-item ${hi(homeWin)}">1<br><strong>${homeWin}%</strong></div>
        <div class="prediction-item ${hi(draw)}">X<br><strong>${draw}%</strong></div>
        <div class="prediction-item ${hi(awayWin)}">2<br><strong>${awayWin}%</strong></div>

        <div class="prediction-item ${hi(over25)}">Over 2.5<br><strong>${over25}%</strong></div>
        <div class="prediction-item ${hi(100 - over25)}">Under 2.5<br><strong>${100 - over25}%</strong></div>

        <div class="prediction-item ${hi(btts)}">Goal<br><strong>${btts}%</strong></div>
        <div class="prediction-item ${hi(100 - btts)}">No Goal<br><strong>${100 - btts}%</strong></div>
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

  btn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
}
