document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
});

/* =======================
   LOAD MATCHES
======================= */
async function loadMatches() {
  const box = document.getElementById("predictions-list");
  if (!box) return;

  const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
  const data = await res.json();
  const fixtures = data.fixtures || [];

  box.innerHTML = "";

  fixtures.forEach(match => {
    const lambdaHome = 1.35;
    const lambdaAway = 1.15;

    const poisson = calculatePoisson(lambdaHome, lambdaAway);
    const odds = calculate1X2(match);

    const card = document.createElement("div");
    card.className = "prediction-card";

    card.innerHTML = `
      <div class="prediction-header">
        ${match.teams.home.name} vs ${match.teams.away.name}
      </div>

      <div class="prediction-grid">

        <div>
          <div class="prediction-section-title">Match Result</div>
          ${row("1", odds["1"])}
          ${row("X", odds["X"])}
          ${row("2", odds["2"])}
        </div>

        <div>
          <div class="prediction-section-title">Double Chance</div>
          ${row("1X", odds["1X"])}
          ${row("X2", odds["X2"])}
          ${row("12", odds["12"])}
        </div>

        <div>
          <div class="prediction-section-title">Goals</div>
          ${row("Over 1.5", poisson.over15)}
          ${row("Over 2.5", poisson.over25)}
          ${row("Goal", poisson.goal)}
        </div>

      </div>
    `;

    box.appendChild(card);
  });
}

/* =======================
   HELPERS
======================= */
function row(label, perc) {
  const high = perc >= 70 ? "prediction-high" : "";
  return `
    <div class="prediction-row ${high}">
      <span>${label}</span>
      <strong>${perc}%</strong>
    </div>
  `;
}

/* =======================
   POISSON
======================= */
function calculatePoisson(lh, la) {
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

function poisson(k, l) {
  return Math.pow(l, k) * Math.exp(-l) / factorial(k);
}

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

/* =======================
   1X2 / DOUBLE CHANCE
======================= */
function calculate1X2() {
  let p1 = 45, px = 30, p2 = 25;
  return {
    "1": p1,
    "X": px,
    "2": p2,
    "1X": p1 + px,
    "X2": px + p2,
    "12": p1 + p2
  };
}
