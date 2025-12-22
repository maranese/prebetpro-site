document.addEventListener("DOMContentLoaded", () => {
  loadMatches();
  loadDailyReport();
});

/* ================= MATCHES ================= */
async function loadMatches() {
  const box = document.getElementById("matches");
  if (!box) return;

  box.innerHTML = "⏳ Loading matches...";

  const res = await fetch("https://prebetpro-api.vincenzodiguida.workers.dev");
  const data = await res.json();
  const fixtures = data.fixtures || [];

  box.innerHTML = "";
  renderStatistics(fixtures);
  renderPredictions(fixtures);

  fixtures.forEach(m => {
    const finished = ["FT","AET","PEN"].includes(m.fixture.status.short);

    const details = finished ? `
      <details class="match-details">
        <summary>Match details</summary>
        <div class="details-content">
          1st Half: ${m.score.halftime.home} – ${m.score.halftime.away}<br>
          Full Time: ${m.score.fulltime.home} – ${m.score.fulltime.away}
        </div>
      </details>` : "";

    box.innerHTML += `
      <div class="match-card">
        <div class="match-league">${m.league.name}</div>
        <div class="match-teams">${m.teams.home.name} vs ${m.teams.away.name}</div>
        <div class="match-info">
          <span>${finished ? `${m.goals.home} – ${m.goals.away}` : "⏳"}</span>
          <span>${m.fixture.status.short}</span>
        </div>
        ${details}
      </div>
    `;
  });
}

/* ================= STATS ================= */
function renderStatistics(fixtures) {
  const box = document.getElementById("stats-summary");
  if (!box) return;

  let ns=0, live=0, ft=0;
  fixtures.forEach(f=>{
    const s=f.fixture.status.short;
    if(s==="NS") ns++;
    else if(["1H","2H"].includes(s)) live++;
    else if(["FT","AET","PEN"].includes(s)) ft++;
  });

  box.innerHTML = `
    <div class="stat-card"><h3>${fixtures.length}</h3><p>Total</p></div>
    <div class="stat-card"><h3>${ns}</h3><p>Not started</p></div>
    <div class="stat-card"><h3>${live}</h3><p>Live</p></div>
    <div class="stat-card"><h3>${ft}</h3><p>Finished</p></div>
  `;
}

/* ================= PREDICTIONS ================= */
function renderPredictions(fixtures) {
  const box = document.getElementById("predictions-list");
  if (!box) return;
  box.innerHTML = "";

  fixtures.forEach(m => {
    const poisson = calculatePoisson(1.35,1.15);
    const oneXtwo = calculate1X2();

    box.innerHTML += `
      <div class="prediction-card">
        <div class="prediction-header">${m.teams.home.name} vs ${m.teams.away.name}</div>

        <div class="prediction-grid">
          <div class="prediction-block">
            <div class="prediction-section-title">Match Result</div>
            ${row("1",oneXtwo["1"])}
            ${row("X",oneXtwo["X"])}
            ${row("2",oneXtwo["2"])}
          </div>

          <div class="prediction-block">
            <div class="prediction-section-title">Double Chance</div>
            ${row("1X",oneXtwo["1X"])}
            ${row("X2",oneXtwo["X2"])}
            ${row("12",oneXtwo["12"])}
          </div>

          <div class="prediction-block">
            <div class="prediction-section-title">Goals</div>
            ${row("Over 1.5",poisson.o15)}
            ${row("Over 2.5",poisson.o25)}
            ${row("Goal",poisson.goal)}
          </div>
        </div>
      </div>
    `;
  });
}

function row(label,perc){
  const high = perc>=70 ? "high-confidence":"";
  return `<div class="prediction-row ${high}">
    <span>${label}</span><strong>${perc}%</strong>
  </div>`;
}

/* ================= MODELS ================= */
function calculatePoisson(lh,la){
  let o15=0,o25=0,goal=0;
  for(let h=0;h<=5;h++){
    for(let a=0;a<=5;a++){
      const p=(Math.pow(lh,h)*Math.exp(-lh)/fact(h))*(Math.pow(la,a)*Math.exp(-la)/fact(a));
      if(h+a>=2) o15+=p;
      if(h+a>=3) o25+=p;
      if(h>0&&a>0) goal+=p;
    }
  }
  return {
    o15:Math.round(o15*100),
    o25:Math.round(o25*100),
    goal:Math.round(goal*100)
  };
}

function calculate1X2(){
  const p1=45,px=28,p2=27;
  return {"1":p1,"X":px,"2":p2,"1X":p1+px,"X2":px+p2,"12":p1+p2};
}

function fact(n){return n<=1?1:n*fact(n-1);}

/* ================= REPORT ================= */
async function loadDailyReport(){
  const box=document.getElementById("report-summary");
  if(!box) return;
  box.innerHTML="Report ready";
}
