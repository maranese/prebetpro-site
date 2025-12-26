const VALUE_THRESHOLD = 0.07;

export async function buildValuePicks(date, env) {
  const oddsSnap = await env.prebetpro_kv.get(`odds:${date}`, { type: "json" });
  if (!oddsSnap) return [];

  const picks = [];

  for (const [fid, odds] of Object.entries(oddsSnap.fixtures)) {
    const pred = await env.prebetpro_kv.get(`prediction:${fid}`, { type: "json" });
    if (!pred || pred.confidence !== "high") continue;

    for (const [market, probPct] of Object.entries(pred.markets)) {
      const odd = odds[market];
      if (!odd) continue;

      const prob = probPct / 100;
      const edge = prob * odd - 1;

      if (edge >= VALUE_THRESHOLD) {
        picks.push({
          fixture_id: fid,
          market,
          probability: prob,
          odds: odd,
          edge: Number(edge.toFixed(2))
        });
      }
    }
  }

  return picks.sort((a, b) => b.edge - a.edge);
}
