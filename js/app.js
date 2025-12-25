document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadDailyReport();
  initBackToTop();
});

/* =========================
   LOAD TODAY MATCHES
========================= */
async function loadMatches() {
  const matchesBox = document.getElementById("matches");
  const noMatchesBox = document.getElementById("no-matches");
  const statsBox = document.getElementById("stats-summary");

  if (!matchesBox) return;

  matchesBox.innerHTML = "⏳ Loading matches...";

  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev"
    );
    if (!response.ok) throw new Error("API error");

    const data = await response.json();
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
      const home = match.teams?.home?.name || "Home";
      const away = match.teams?.away?.name || "Away";
      const status = match.fixture?.status?.short || "ND";
      const goalsH = match.goals?.home;
      const goalsA = match.goals?.away;
      const finished = ["FT", "AET", "PEN"].includes(status);

      const time = match.fixture?.date
        ? new Date(match.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "ND";

      const scoreHtml = finished
        ? `<strong>${goalsH} – ${goalsA}</strong>`
        : `🕒 ${time}`;

      let detailsHtml = "";
      if (finished) {
        detailsHtml = `
          <details class="match-details">
            <summary>Match details ▾</summary>
            <div class="details-content">
              <div>1st Half: ${match.score?.halftime?.home ?? "ND"} – ${match.score?.halftime?.away ?? "ND"}</div>
              <div>Full Time: ${match.score?.fulltime?.home ?? "ND"} – ${match.score?.fulltime?.away ?? "ND"}</div>
              ${
                match.score?.extratime
                  ? `<div>Extra Time: ${match.score.extratime.home} – ${match.score.extratime.away}</div>`
                  : ""
              }
              ${
                match.score?.penalty
                  ? `<div>Penalties: ${match.score.penalty.home} – ${match.score.penalty.away}</div>`
                  : ""
              }
            </div>
          </details>
        `;
      }

      card.innerHTML = `
        <div class="match-league">
          ${logo ? `<img src="${logo}" style="width:18px;vertical-align:middle">` : ""}
          ${league}
        </div>

        <div class="match-teams">${home} <strong>vs</strong> ${away}</div>

        <div class="match-info">
          <span>${scoreHtml}</span>
          <span><strong>${status}</strong></span>
        </div>

        ${detailsHtml}
      `;

      matchesBox.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    matchesBox.innerHTML = `
      <div class="no-data">
        Data temporarily unavailable.<br>
        Please try again later.
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
    const s = f.fixture?.status?.short;
    if (s === "NS") ns++;
    else if (["1H", "HT", "2H"].includes(s)) live++;
    else if (["FT", "AET", "PEN"].includes(s)) ft++;
  });

  box.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total matches</p></div>
    <div class="stat-card"><h3>${ns}</h3><p>Not started</p></div>
    <div class="stat-card"><h3>${live}</h3><p>Live</p></div>
    <div class="stat-card"><h3>${ft}</h3><p>Finished</p></div>
  `;
}

/* =========================
   DAILY REPORT
========================= */
async function loadDailyReport() {
  const summaryBox = document.getElementById("report-summary");
  const matchesBox = document.getElementById("report-matches");
  const emptyBox = document.getElementById("report-empty");

  if (!summaryBox || !matchesBox || !emptyBox) return;

  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev/report"
    );
    if (!response.ok) throw new Error("Report API error");

    const data = await response.json();

    if (!data?.matches || data.matches.length === 0) {
      emptyBox.style.display = "block";
      return;
    }

    emptyBox.style.display = "none";

    summaryBox.innerHTML = `
      <div class="stat-card">
        <h3>${data.matches.length}</h3>
        <p>Finished matches</p>
      </div>
    `;

    data.matches.forEach(m => {
      const div = document.createElement("div");
      div.className = "report-match";
      div.innerHTML = `
        <div class="teams">
          ${m.home} ${m.goals_home} – ${m.goals_away} ${m.away}
        </div>
      `;
      matchesBox.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    emptyBox.style.display = "block";
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
