export async function savePredictionSnapshot(f, env) {
  const key = `prediction:${f.fixture.id}`;
  if (await env.prebetpro_kv.get(key)) return;

  const p = f.predictions;
  const s = p.strength;
  const markets = {};

  if (s.home_win) markets["1"] = p.home_win;
  if (s.draw) markets["X"] = p.draw;
  if (s.away_win) markets["2"] = p.away_win;
  if (s.dc_1x) markets["1X"] = p.double_chance["1x"];
  if (s.dc_x2) markets["X2"] = p.double_chance["x2"];
  if (s.dc_12) markets["12"] = p.double_chance["12"];
  if (s.under_25) markets["Under 2.5"] = p.under_25;
  if (s.over_25) markets["Over 2.5"] = p.over_25;
  if (s.btts) markets["Goal"] = p.btts;
  if (s.no_btts) markets["No Goal"] = p.no_btts;

  await env.prebetpro_kv.put(
    key,
    JSON.stringify({
      fixture_id: f.fixture.id,
      date: new Date().toISOString().slice(0, 10),
      confidence: f.confidence,
      markets,
      evaluated: false
    })
  );
}
