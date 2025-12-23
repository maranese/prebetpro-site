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
    const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
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

  } catch (e) {
    matchesBox.innerHTML = `<div class="no-data">Data unavailable</div>`;
  }
}

/* =========================
   PREDICTIONS (HYBRID)
========================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  const empty = document.getElementById("predictions-empty");
  if (!box) return;

  box.innerHTML = "";
  empty.style.display = "none";

  fixtures.forEach(match => {
    const probsOU = calculatePoissonProbabilities(1.35, 1.15);
    const probs1X2 = calculate1X2Probabilities();

    const card = document.createElement("div");
    card.className = "prediction-card";

    card.innerHTML = `
      <div class="prediction-header">
        ${match.teams.home.name} vs ${match.teams.away.name}
      </div>

      <div class="prediction-section-title">Match Result</div>
      <div class="prediction-grid">
        ${predictionRow("1", probs1X2["1"])}
        ${predictionRow("X", probs1X2["X"])}
        ${predictionRow("2", probs1X2["2"])}
      </div>

      <div class="prediction-section-title">Double Chance</div>
      <div class="prediction-grid">
        ${predictionRow("1X", probs1X2["1X"])}
        ${predictionRow("X2", probs1X2["X2"])}
        ${predictionRow("12", probs1X2["12"])}
      </div>

      <div class="prediction-section-title">Goals</div>
      <div class="prediction-grid">
        ${predictionRow("Over 1.5", probsOU.over15)}
        ${predictionRow("Over 2.5", probsOU.over25)}
        ${predictionRow("Goal (BTTS)", probsOU.goal)}
      </div>
    `;

    box.appendChild(card);
  });
}

/* =========================
   ROW RENDER
========================= */
function predictionRow(label, perc) {
  const high = perc >= 70 ? "prediction-high" : "";
  return `
    <div class="prediction-row ${high}">
      <span>${label}</span>
      <strong>${perc}%</strong>
      <span class="prediction-odds">odds ND</span>
    </div>
  `;
}

/* =========================
   1X2 MODEL (BASE)
========================= */
function calculate1X2Probabilities() {
  let p1 = 45, px = 28, p2 = 27;
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
   POISSON
========================= */
function poisson(k, l) {
  return Math.pow(l, k) * Math.exp(-l) / factorial(k);
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
