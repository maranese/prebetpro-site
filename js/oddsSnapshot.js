export async function snapshotOdds(date, env) {
  const res = await fetch(
    `https://v3.football.api-sports.io/odds?date=${date}`,
    { headers: { "x-apisports-key": env.API_FOOTBALL_KEY_DIRECT } }
  );

  const data = (await res.json()).response || [];
  const fixtures = {};

  for (const f of data) {
    const bet365 = f.bookmakers.find(b => b.name === "Bet365");
    if (!bet365) continue;

    const markets = {};
    for (const m of bet365.bets) {
      if (m.name === "Match Winner") {
        m.values.forEach(v => markets[v.value === "Home" ? "1" : v.value === "Draw" ? "X" : "2"] = Number(v.odd));
      }
      if (m.name === "Goals Over/Under") {
        m.values.forEach(v => {
          if (v.value === "Under 2.5") markets["Under 2.5"] = Number(v.odd);
        });
      }
      if (m.name === "Both Teams To Score") {
        m.values.forEach(v => markets[v.value === "Yes" ? "Goal" : "No Goal"] = Number(v.odd));
      }
    }

    if (Object.keys(markets).length) {
      fixtures[f.fixture.id] = markets;
    }
  }

  await env.prebetpro_kv.put(
    `odds:${date}`,
    JSON.stringify({ date, bookmaker: "bet365", fixtures })
  );
}
