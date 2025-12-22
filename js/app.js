const matchesContainer = document.getElementById("matches");

async function loadMatches() {
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
          Puoi consultare statistiche, report storici o le principali competizioni.
        </div>
      `;
      return;
    }

    // Partite presenti
    matchesContainer.innerHTML = "";

    data.fixtures.forEach(match => {
      const league = match.league?.name || "ND";
      const country = match.league?.country || "";
      const home = match.teams?.home?.name || "ND";
      const away = match.teams?.away?.name || "ND";
      const status = match.fixture?.status?.short || "ND";
      const date = match.fixture?.date
        ? new Date(match.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "ND";

      matchesContainer.innerHTML += `
        <div class="match-card">
          <div class="league">${league} ${country ? `(${country})` : ""}</div>
          <div class="teams">${home} <span>vs</span> ${away}</div>
          <div class="meta">
            <span class="time">${date}</span>
            <span class="status">${status}</span>
          </div>
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

loadMatches();
