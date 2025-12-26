export async function savePredictionSnapshot(fixture, env) {
  const key = `prediction:${fixture.fixture.id}`;

  const existing = await env.prebetpro_kv.get(key);
  if (existing) return;

  const markets = {};
  const p = fixture.predictions;
  const s = p.strength;

  if (s.home_win) markets["1"] = p.home_win;
  if (s.draw) markets["X"] = p.draw;
  if (s.away_win) markets["2"] = p.away_win;

  if (s.dc_1x) markets["1X"] = p.double_chance["1x"];
  if (s.dc_x2) markets["X2"] = p.double_chance["x2"];
  if (s.dc_12) markets["12"] = p.double_chance["12"];

  if (s.under_25) markets["Under 2.5"] = p.under_25;
  if (s.over_25) markets["Over 2.5"] = p.over_25;
  if (s.over_15) markets["Over 1.5"] = p.over_15;

  if (s.no_btts) markets["No Goal"] = p.no_btts;
  if (s.btts) markets["Goal"] = p.btts;

  const snapshot = {
    fixture_id: fixture.fixture.id,
    date: getTodayRome(),
    home: fixture.teams.home.name,
    away: fixture.teams.away.name,
    confidence: fixture.confidence,
    markets,
    result: null,
    evaluated: false
  };

  await env.prebetpro_kv.put(key, JSON.stringify(snapshot));
}
