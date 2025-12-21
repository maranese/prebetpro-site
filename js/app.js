const matchesContainer = document.getElementById("matches");

async function loadTodayMatches() {
  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev"
    );

    const data = await response.json();

    // Caso: nessuna partita
    if (!data.fixtures || data.fixtures.length === 0) {
      matchesContainer.innerHTML = `
        <div class="no-data">
          Oggi non ci sono partite disponibili per i campionati monitorati.<br>
          Consulta le statistiche e i report storici.
        </div>
      `;
      return;
    }

    // Caso: partite presenti
    matchesContainer.innerHTML = "";

    data.fixtures.forEach(match => {
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const league = match.league.name;
      const time = match.fixture.date
        ? new Date(match.fixture.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "ND";

      matchesContainer.innerHTML += `
        <div class="match-card">
          <div class="league">${league}</div>
          <div class="teams">${home} vs ${away}</div>
          <div class="time">${time}</div>
        </div>
      `;
    });

  } catch (error) {
    matchesContainer.innerHTML = `
      <div class="no-data">
        Dati temporaneamente non disponibili.<br>
        Riprova più tardi.
      </div>
    `;
  }
}

loadTodayMatches();
