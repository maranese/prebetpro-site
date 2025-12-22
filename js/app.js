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
