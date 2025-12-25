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
    const fixtures = json.fixtures || [];

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

    fixtures.forEach(match => {
      const card = document.createElement("div");
      card.className = "match-card";

      const league = match.league?.name || "ND";
      const logo = match.league?.logo;
      const home = match.teams?.home?.name || "Home";
      const away = match.teams?.away?.name || "Away";
      const status = match.fixture?.status?.short || "ND";
      const finished = ["FT", "AET", "PEN"].includes(status);

      const score = finished
        ? `${match.goals.home} – ${match.goals.away}`
        : new Date(match.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          });

      let predictionsHTML = "";

      if (!match.predictions || match.confidence === "low") {
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
   PREDICTIONS – SEPARATE SECTION
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

    card.innerHTML = `
      <div class="prediction-header">
        ${match.teams.home.name} vs ${match.teams.away.name}
      </div>

      <div class="prediction-info">
        Previsioni complete disponibili
        quando il modello avrà dati sufficienti.
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
