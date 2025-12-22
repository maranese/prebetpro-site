document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadDailyReport();
});

/* =========================
   MATCHES
========================= */
async function loadMatches() {
  const container = document.getElementById("matches");
  const noDataBox = document.getElementById("no-matches");

  container.innerHTML = "⏳ Caricamento partite in corso...";

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    const data = await res.json();

    if (!data.fixtures || data.fixtures.length === 0) {
      container.innerHTML = "";
      if (noDataBox) noDataBox.style.display = "block";
      return;
    }

    if (noDataBox) noDataBox.style.display = "none";
    container.innerHTML = "";

    renderStatistics(data.fixtures);

    data.fixtures.forEach(match => {
      const card = document.createElement("div");
      card.className = "match-card";

      const time = new Date(match.fixture.date).toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit"
      });

      card.innerHTML = `
  <div class="match-league">
    ${match.league.logo ? `<img src="${match.league.logo}" />` : ""}
    ${match.league.name}
  </div>

  <div class="match-teams">
    ${match.teams.home.name} <strong>vs</strong> ${match.teams.away.name}
  </div>

  <div class="match-info">
    <span>🕒 ${time}</span>
    <strong>${match.fixture.status.short}</strong>
  </div>
`;

      `;

      container.appendChild(card);
    });

  } catch {
    container.innerHTML = `<div class="no-data">Dati non disponibili</div>`;
  }
}

/* =========================
   STATISTICS
========================= */
function renderStatistics(fixtures) {
  const box = document.getElementById("stats-summary");
  if (!box) return;

  const total = fixtures.length;
  const finished = fixtures.filter(f =>
    ["FT","AET","PEN"].includes(f.fixture.status.short)
  ).length;

  box.innerHTML = `
    <div class="stat-card"><h3>${total}</h3><p>Total matches</p></div>
    <div class="stat-card"><h3>${finished}</h3><p>Finished</p></div>
  `;
}

/* =========================
   REPORT FIX (FONDAMENTALE)
========================= */
async function loadDailyReport() {
  const summary = document.getElementById("report-summary");
  const matches = document.getElementById("report-matches");
  const empty = document.getElementById("report-empty");

  if (!summary || !matches || !empty) return;

  try {
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev/report");
    const data = await res.json();

    if (!data || !data.matches || data.matches.length === 0) {
      summary.innerHTML = "";
      matches.innerHTML = "";
      empty.style.display = "block";
      empty.innerHTML = `
        Nessun report disponibile al momento.<br>
        Le partite di oggi non sono ancora concluse.
      `;
      return;
    }

    empty.style.display = "none";

    summary.innerHTML = `
      <div class="stat-card"><h3>${data.total_matches}</h3><p>Total</p></div>
      <div class="stat-card"><h3>${data.finished_matches}</h3><p>Finished</p></div>
    `;

    matches.innerHTML = "";
    data.matches.forEach(m => {
      const div = document.createElement("div");
      div.className = "report-match";
      div.innerHTML = `
        <div class="league">${m.league}</div>
        <div class="teams">${m.home} vs ${m.away}</div>
        <div class="score">${m.goals_home} – ${m.goals_away}</div>
      `;
      matches.appendChild(div);
    });

  } catch {
    empty.style.display = "block";
    empty.innerHTML = "Errore nel caricamento del report.";
  }
}

/* =========================
   BACK TO TOP
========================= */
const backToTop = document.getElementById("back-to-top");

window.addEventListener("scroll", () => {
  backToTop.style.display = window.scrollY > 300 ? "block" : "none";
});

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
