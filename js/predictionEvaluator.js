export async function evaluatePrediction(f, env) {
  const key = `prediction:${f.fixture.id}`;
  const snap = await env.prebetpro_kv.get(key, { type: "json" });
  if (!snap || snap.evaluated) return;

  const hg = f.goals.home;
  const ag = f.goals.away;

  const outcome = {
    "1": hg > ag,
    "X": hg === ag,
    "2": ag > hg,
    "1X": hg >= ag,
    "X2": ag >= hg,
    "12": hg !== ag,
    "Under 2.5": hg + ag <= 2,
    "Over 2.5": hg + ag >= 3,
    "Goal": hg > 0 && ag > 0,
    "No Goal": hg === 0 || ag === 0
  };

  snap.result = {};
  for (const m in snap.markets) {
    snap.result[m] = outcome[m];
  }

  snap.evaluated = true;
  await env.prebetpro_kv.put(key, JSON.stringify(snap));
}
