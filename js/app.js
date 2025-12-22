document.addEventListener("DOMContentLoaded", loadMatches);

async function loadMatches() {
  const container = document.getElementById("matches");
  container.innerHTML = "⏳ Caricamento partite in corso...";

  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev"
    );

    const data = await response.json();

    if (!data.fixtures || data.fixtures.length === 0) {
      container.innerHTML = `
        <div class="no-data">
          Oggi non ci sono partite disponibili per i campionati monitorati.
        </div>`;
      return;
    }

    container.innerHTML = "";

    data.fixtures.forEach(match => {
      const div = document.createElement("div");
      div.className = "match-card";

      const status = match.fixture.status.short;
      const time = new Date(match.fixture.date)
        .toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

      div.innerHTML = `
        <div class="match-league">
          <img src="${match.league.logo}" alt="${match.league.name}" />
          ${match.league.name}
        </div>

        <div class="match-teams">
          <span>${match.teams.home.name}</span>
          <strong>vs</strong>
          <span>${match.teams.away.name}</span>
        </div>

        <div class="match-info">
          🕒 ${time} — ${status}
        </div>
      `;

      container.appendChild(div);
    });

  } catch (error) {
    container.innerHTML = "❌ Errore nel caricamento delle partite.";
    console.error(error);
  }
}
