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

      const leagueName = match.league?.name || "Unknown league";
      const leagueLogo = match.league?.logo || "";
      const home = match.teams?.home?.name || "Home";
      const away = match.teams?.away?.name || "Away";
      const status = match.fixture?.status?.short || "ND";
      const goalsHome = match.goals?.home;
      const goalsAway = match.goals?.away;
      const isFinished = ["FT", "AET", "PEN"].includes(status);

      const time = match.fixture?.date
        ? new Date(match.fixture.date).toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "ND";

      card.innerHTML = `
        <div class="match-league">
          ${
            leagueLogo
              ? `<img src="${leagueLogo}" alt="" style="width:18px;height:18px;margin-right:6px;vertical-align:middle;">`
              : ""
          }
          ${leagueName}
        </div>

        <div class="match-teams">
          ${home} <strong>vs</strong> ${away}
        </div>

       <div class="match-info">
  ${
    isFinished
      ? `<span><strong>${goalsHome} – ${goalsAway}</strong></span>`
      : `<span>🕒 ${time}</span>`
  }
  <span><strong>${status}</strong></span>
</div>

${isFinished ? `
<details class="match-details">
  <summary>Match details ▾</summary>
  <div class="details-content">
    <div>1st Half: ${match.score?.halftime?.home ?? "ND"} – ${match.score?.halftime?.away ?? "ND"}</div>
    <div>2nd Half: ${match.score?.fulltime?.home ?? "ND"} – ${match.score?.fulltime?.away ?? "ND"}</div>
    ${match.score?.extratime ? `<div>Extra Time: ${match.score.extratime.home} – ${match.score.extratime.away}</div>` : ""}
    ${match.score?.penalty ? `<div>Penalties: ${match.score.penalty.home} – ${match.score.penalty.away}</div>` : ""}
  </div>
</details>
` : ""}


      matchesBox.appendChild(card);
    });

  } catch (error) {
    console.error("Errore loadMatches:", error);
    matchesBox.innerHTML = `
      <div class="no-data">
        Matches temporarily unavailable.<br>
        Please try again later.
      </div>
    `;
    if (noMatchesBox) noMatchesBox.style.display = "none";
    if (statsBox) statsBox.innerHTML = "";
  }
}

/* =========================
   STATISTICS
========================= */
function renderStatistics(fixtures) {
  const box = document.getElementById("stats-summary");
  if (!box) return;

  let notStarted = 0;
  let live = 0;
  let finished = 0;

  fixtures.forEach(f => {
    const s = f.fixture?.status?.short;
    if (s === "NS") notStarted++;
    else if (["1H", "HT", "2H", "ET"].includes(s)) live++;
    else if (["FT", "AET", "PEN"].includes(s)) finished++;
  });

  box.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total matches</p></div>
    <div class="stat-card"><h3>${notStarted}</h3><p>Not started</p></div>
    <div class="stat-card"><h3>${live}</h3><p>Live</p></div>
    <div class="stat-card"><h3>${finished}</h3><p>Finished</p></div>
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

  summaryBox.innerHTML = "";
  matchesBox.innerHTML = "";
  emptyBox.style.display = "none";

  try {
    const response = await fetch(
      "https://prebetpro-api.vincenzodiguida.workers.dev/report"
    );
    if (!response.ok) throw new Error("Report API error");

    const data = await response.json();

    if (!data || !data.matches || data.matches.length === 0) {
      emptyBox.style.display = "block";
      emptyBox.innerHTML = `
        No report available yet.<br>
        Matches may not be finished.
      `;
      return;
    }

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

  } catch (error) {
    console.error("Errore loadDailyReport:", error);
    emptyBox.style.display = "block";
    emptyBox.innerHTML = `Unable to load report at the moment.`;
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

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   PREDICTIONS (RULE-BASED)
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  const empty = document.getElementById("predictions-empty");
  if (!box) return;

  if (!fixtures || fixtures.length === 0) {
    empty.style.display = "block";
    box.innerHTML = "";
    return;
  }

  empty.style.display = "none";
  box.innerHTML = "";

  fixtures.forEach(match => {
    // λ stimati (v1)
    const lambdaHome = 1.35;
    const lambdaAway = 1.15;

    const probs = calculatePoissonProbabilities(lambdaHome, lambdaAway);

    const status = match.fixture.status.short;
    const goalsHome = match.goals.home;
    const goalsAway = match.goals.away;

    // Verifica esiti reali
    const finished = ["FT", "AET", "PEN"].includes(status);
    const totalGoals = finished ? goalsHome + goalsAway : null;

    const over15Won = finished ? totalGoals >= 2 : null;
    const over25Won = finished ? totalGoals >= 3 : null;
    const goalWon = finished ? (goalsHome > 0 && goalsAway > 0) : null;

    const card = document.createElement("div");
    card.className = "prediction-card";

    card.innerHTML = `
      <div class="prediction-header">
        ${match.teams.home.name} vs ${match.teams.away.name}
      </div>

      ${renderPredictionRow("Over 1.5", probs.over15, over15Won)}
      ${renderPredictionRow("Over 2.5", probs.over25, over25Won)}
      ${renderPredictionRow("Goal (BTTS)", probs.goal, goalWon)}
    `;

    box.appendChild(card);
  });
}

/* =========================
   SINGLE ROW RENDER
========================= */
function renderPredictionRow(label, percent, won) {
  let className = "";
  let icon = "";

  if (won === true) {
    className = "prediction-win";
    icon = "✅";
  } else if (won === false) {
    className = "prediction-lose";
    icon = "❌";
  }

  return `
    <div class="prediction-row ${className}">
      <span>${label}</span>
      <strong>${percent}% ${icon}</strong>
    </div>
  `;
}


  empty.style.display = "none";
  box.innerHTML = "";

  fixtures.forEach(match => {
    let over15 = 65;
    let over25 = 50;
    let goal = 55;

    const leagueName = match.league?.name?.toLowerCase() || "";

    if (
      leagueName.includes("premier") ||
      leagueName.includes("bundesliga") ||
      leagueName.includes("eredivisie")
    ) {
      over15 += 5;
      over25 += 5;
      goal += 5;
    }

    over15 = Math.min(over15, 85);
    over25 = Math.min(over25, 80);
    goal = Math.min(goal, 80);

    const card = document.createElement("div");
    card.className = "prediction-card";

    card.innerHTML = `
      <div class="prediction-header">
        ${match.teams.home.name} vs ${match.teams.away.name}
      </div>
      <div class="prediction-row"><span>Over 1.5</span><strong>${over15}%</strong></div>
      <div class="prediction-row"><span>Over 2.5</span><strong>${over25}%</strong></div>
      <div class="prediction-row"><span>Goal (BTTS)</span><strong>${goal}%</strong></div>
    `;

    box.appendChild(card);
  });
}
/* =========================
   POISSON UTILITIES
========================= */
function poisson(k, lambda) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function factorial(n) {
  if (n === 0) return 1;
  let res = 1;
  for (let i = 1; i <= n; i++) res *= i;
  return res;
}

/* =========================
   POISSON PROBABILITIES
========================= */
function calculatePoissonProbabilities(lambdaHome, lambdaAway) {
  let probOver15 = 0;
  let probOver25 = 0;
  let probGoal = 0;

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p =
        poisson(h, lambdaHome) *
        poisson(a, lambdaAway);

      const totalGoals = h + a;

      if (totalGoals >= 2) probOver15 += p;
      if (totalGoals >= 3) probOver25 += p;
      if (h > 0 && a > 0) probGoal += p;
    }
  }

  return {
    over15: Math.round(probOver15 * 100),
    over25: Math.round(probOver25 * 100),
    goal: Math.round(probGoal * 100)
  };
}
