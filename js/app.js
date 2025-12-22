document.addEventListener("DOMContentLoaded", loadMatches);

async function loadMatches() {
  const container = document.getElementById("matches");
  const noDataBox = document.getElementById("no-matches");

  container.innerHTML = "⏳ Caricamento partite in corso...";

  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev"
    );

    if (!response.ok) {
      throw new Error("Risposta non valida dal server");
    }

    const data = await response.json();

    // Se fixtures non esistono o sono vuote
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

      const league = match.league?.name || "ND";
      const home = match.teams?.home?.name || "ND";
      const away = match.teams?.away?.name || "ND";
      const status = match.fixture?.status?.short || "ND";

      const time = match.fixture?.date
        ? new Date(match.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "ND";

      card.innerHTML = `
        <div class="match-league">
          ${match.league?.logo ? `<img src="${match.league.logo}" />` : ""}
          ${league}
        </div>

        <div class="match-teams">
          ${home} <strong>vs</strong> ${away}
        </div>

        <div class="match-info">
          <span>🕒 ${time}</span>
          <span class="match-status">${status}</span>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Errore caricamento partite:", error);
    container.innerHTML = `
      <div class="no-data">
        Dati temporaneamente non disponibili.<br>
        Riprova più tardi.
      </div>
    `;
  }
}
function renderStatistics(fixtures) {
  const statsBox = document.getElementById("stats-summary");
  if (!statsBox) return;

  const total = fixtures.length;

  const byStatus = {
    NS: 0,
    LIVE: 0,
    FINISHED: 0
  };

  const byLeague = {};

  fixtures.forEach(m => {
    const status = m.fixture.status.short;

    if (status === "NS") byStatus.NS++;
    else if (["1H","HT","2H","ET"].includes(status)) byStatus.LIVE++;
    else if (["FT","AET","PEN"].includes(status)) byStatus.FINISHED++;

    const league = m.league.name;
    byLeague[league] = (byLeague[league] || 0) + 1;
  });

  let html = `
    <div class="stat-card">
      <h3>${total}</h3>
      <p>Total matches</p>
    </div>
    <div class="stat-card">
      <h3>${byStatus.NS}</h3>
      <p>Not started</p>
    </div>
    <div class="stat-card">
      <h3>${byStatus.LIVE}</h3>
      <p>Live</p>
    </div>
    <div class="stat-card">
      <h3>${byStatus.FINISHED}</h3>
      <p>Finished</p>
    </div>
  `;

  statsBox.innerHTML = html;
}
async function loadDailyReport() {
  const summaryBox = document.getElementById("report-summary");
  const matchesBox = document.getElementById("report-matches");
  const emptyBox = document.getElementById("report-empty");

  if (!summaryBox || !matchesBox) return;

  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev/report"
    );

    const data = await response.json();

    // Se report non disponibile
    if (!data.matches || data.matches.length === 0) {
      summaryBox.innerHTML = "";
      matchesBox.innerHTML = "";
      emptyBox.style.display = "block";
      return;
    }

    emptyBox.style.display = "none";

    // SUMMARY
    summaryBox.innerHTML = `
      <div class="stat-card">
        <h3>${data.total_matches}</h3>
        <p>Total matches</p>
      </div>
      <div class="stat-card">
        <h3>${data.finished_matches}</h3>
        <p>Finished</p>
      </div>
      <div class="stat-card">
        <h3>${data.competitions.length}</h3>
        <p>Competitions</p>
      </div>
    `;

    // MATCHES
    matchesBox.innerHTML = "";

    data.matches.forEach(m => {
      const div = document.createElement("div");
      div.className = "report-match";

      div.innerHTML = `
        <div class="league">${m.league}</div>
        <div class="teams">${m.home} vs ${m.away}</div>
        <div class="score">${m.goals_home} – ${m.goals_away}</div>
      `;

      matchesBox.appendChild(div);
    });

  } catch (err) {
    console.error("Errore caricamento report:", err);
  }
}
