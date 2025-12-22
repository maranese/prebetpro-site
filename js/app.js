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
      noMatchesBox.style.display = "block";
      statsBox.innerHTML = "";
      return;
    }

    noMatchesBox.style.display = "none";
    matchesBox.innerHTML = "";

    renderStatistics(fixtures);
    renderPredictions(fixtures);

    fixtures.forEach(match => {
      const card = document.createElement("div");
      card.className = "match-card";

      const league = match.league?.name || "Unknown league";
      const logo = match.league?.logo || "";
      const home = match.teams.home.name;
      const away = match.teams.away.name;
      const status = match.fixture.status.short;
      const goalsH = match.goals.home;
      const goalsA = match.goals.away;
      const finished = ["FT", "AET", "PEN"].includes(status);

      const time = new Date(match.fixture.date)
        .toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });

      let scoreHtml = finished
        ? `<strong>${goalsH} – ${goalsA}</strong>`
        : `🕒 ${time}`;

      let detailsHtml = "";
      if (finished) {
        detailsHtml = `
          <details class="match-details">
            <summary>Match details ▾</summary>
            <div class="details-content">
              <div>1st Half: ${match.score.halftime.home} – ${match.score.halftime.away}</div>
              <div>Full Time: ${match.score.fulltime.home} – ${match.score.fulltime.away}</div>
              ${
                match.score.extratime
                  ? `<div>Extra Time: ${match.score.extratime.home} – ${match.score.extratime.away}</div>`
                  : ""
              }
              ${
                match.score.penalty
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
    matchesBox.innerHTML = `<div class="no-data">Data temporarily unavailable</div>`;
    console.error(err);
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
    else if (["1H","2H","HT"].includes(s)) live++;
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
   PREDICTIONS — POISSON
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  const empty = document.getElementById("predictions-empty");
  if (!box) return;

  box.innerHTML = "";
  empty.style.display = "none";

  fixtures.forEach(match => {
    const lambdaHome = 1.35;
    const lambdaAway = 1.15;

    const probs = calculatePoissonProbabilities(lambdaHome, lambdaAway);
    const probs1X2 = calculate1X2Probabilities(match);

    const finished = ["FT","AET","PEN"].includes(match.fixture.status.short);
    const goals = finished ? match.goals.home + match.goals.away : null;

    const over15Win = finished ? goals >= 2 : null;
    const over25Win = finished ? goals >= 3 : null;
    const goalWin = finished ? (match.goals.home > 0 && match.goals.away > 0) : null;

    const card = document.createElement("div");
    card.className = "prediction-card";

   card.innerHTML = `
  <div class="prediction-header">
    ${match.teams.home.name} vs ${match.teams.away.name}
  </div>

  <div class="prediction-section-title">Goals</div>
  ${predictionRow("Over 1.5", probs.over15, over15Win)}
  ${predictionRow("Over 2.5", probs.over25, over25Win)}
  ${predictionRow("Goal (BTTS)", probs.goal, goalWin)}

  <div class="prediction-section-title">Match Result</div>
  <div class="prediction-row"><span>1</span><strong>${probs1X2["1"]}%</strong></div>
  <div class="prediction-row"><span>X</span><strong>${probs1X2["X"]}%</strong></div>
  <div class="prediction-row"><span>2</span><strong>${probs1X2["2"]}%</strong></div>

  <div class="prediction-section-title">Double Chance</div>
  <div class="prediction-row"><span>1X</span><strong>${probs1X2["1X"]}%</strong></div>
  <div class="prediction-row"><span>X2</span><strong>${probs1X2["X2"]}%</strong></div>
  <div class="prediction-row"><span>12</span><strong>${probs1X2["12"]}%</strong></div>
`;


    box.appendChild(card);
  });
}

function predictionRow(label, perc, win) {
  let cls = "";
  let icon = "";
  if (win === true) { cls = "prediction-win"; icon = "✅"; }
  if (win === false) { cls = "prediction-lose"; icon = "❌"; }

  return `<div class="prediction-row ${cls}">
    <span>${label}</span><strong>${perc}% ${icon}</strong>
  </div>`;
}

/* =========================
   POISSON CORE
========================= */
function poisson(k, lambda) {
  return Math.pow(lambda, k) * Math.exp(-lambda) / factorial(k);
}

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function calculatePoissonProbabilities(lh, la) {
  let o15 = 0, o25 = 0, btts = 0;

  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      const p = poisson(h, lh) * poisson(a, la);
      if (h + a >= 2) o15 += p;
      if (h + a >= 3) o25 += p;
      if (h > 0 && a > 0) btts += p;
    }
  }

  return {
    over15: Math.round(o15 * 100),
    over25: Math.round(o25 * 100),
    goal: Math.round(btts * 100)
  };
}

/* =========================
   1X2 & DOUBLE CHANCE (v1)
========================= */
function calculate1X2Probabilities(match) {
  // Valori base neutri (v1)
  let p1 = 40;
  let px = 30;
  let p2 = 30;

  // Piccolo vantaggio casa
  p1 += 5;
  p2 -= 5;

  // Normalizzazione
  const total = p1 + px + p2;
  p1 = Math.round((p1 / total) * 100);
  px = Math.round((px / total) * 100);
  p2 = 100 - p1 - px;

  return {
    "1": p1,
    "X": px,
    "2": p2,
    "1X": p1 + px,
    "X2": px + p2,
    "12": p1 + p2
  };
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
