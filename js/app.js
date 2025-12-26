const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      const today = new Date().toISOString().split("T")[0];
      const cacheKey = `fixtures:${today}`;

      /* =========================
         DEBUG – TEAM HISTORY
         (temporaneo, da rimuovere più avanti)
      ========================= */
      if (url.pathname === "/debug/team-history") {
        const teamId = url.searchParams.get("team");
        if (!teamId) return json({ error: "Missing team id" }, 400);

        const data = await env.prebetpro_kv.get(
          `team:${teamId}:history`,
          { type: "json" }
        );

        return json(data || { message: "No data" });
      }

      /* =========================
         SNAPSHOT MANUALE
      ========================= */
      if (url.pathname === "/snapshot") {
        const result = await updateFixtures(today, env);
        await updateTeamHistory(today, env);
        return json(result);
      }

      /* =========================
         DAILY REPORT
      ========================= */
      if (url.pathname === "/report") {
        const cached = await env.CACHE.get(cacheKey, { type: "json" });
        if (!cached || !cached.fixtures) return json({ matches: [] });

        const finished = cached.fixtures.filter(f =>
          ["FT", "AET", "PEN"].includes(f.fixture.status.short)
        );

        return json({
          matches: finished.map(f => ({
            home: f.teams.home.name,
            away: f.teams.away.name,
            goals_home: f.goals.home,
            goals_away: f.goals.away,
          }))
        });
      }

      /* =========================
         DEFAULT – FIXTURES CACHE
      ========================= */
      const cached = await env.CACHE.get(cacheKey, { type: "json" });

      if (cached) {
        return json({
          fixtures: cached.fixtures,
          last_update: cached.last_update,
        });
      }

      return json({ fixtures: [], message: "Cache empty" });

    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },

  async scheduled(event, env) {
    const today = new Date().toISOString().split("T")[0];
    await updateFixtures(today, env);
    await updateTeamHistory(today, env);
  }
};

/* =========================
   FIXTURES FETCH + CACHE
========================= */
async function updateFixtures(date, env) {
  const apiUrl = `https://v3.football.api-sports.io/fixtures?date=${date}&timezone=Europe/Rome`;

  const res = await fetch(apiUrl, {
    headers: {
      "x-apisports-key": env.API_FOOTBALL_KEY_DIRECT,
    },
  });

  const json = await res.json();
  const fixtures = json.response || [];

  const payload = {
    fixtures,
    last_update: new Date().toISOString(),
  };

  await env.CACHE.put(`fixtures:${date}`, JSON.stringify(payload), {
    expirationTtl: 60 * 60 * 48,
  });

  return { saved: fixtures.length };
}

/* =========================
   UPDATE TEAM HISTORY (KV)
========================= */
async function updateTeamHistory(date, env) {
  const cached = await env.CACHE.get(`fixtures:${date}`, { type: "json" });
  if (!cached || !cached.fixtures) return;

  const finished = cached.fixtures.filter(f =>
    ["FT", "AET", "PEN"].includes(f.fixture.status.short)
  );

  for (const match of finished) {
    await updateSingleTeam(match, true, env);
    await updateSingleTeam(match, false, env);
  }
}

async function updateSingleTeam(match, isHome, env) {
  const team = isHome ? match.teams.home : match.teams.away;
  const goalsFor = isHome ? match.goals.home : match.goals.away;
  const goalsAgainst = isHome ? match.goals.away : match.goals.home;

  const key = `team:${team.id}:history`;
  let history = await env.prebetpro_kv.get(key, { type: "json" });

  if (!history) {
    history = {
      home: [],
      away: [],
      last_update: null
    };
  }

  const bucket = isHome ? history.home : history.away;

  bucket.push({
    date: match.fixture.date,
    goals_for: goalsFor,
    goals_against: goalsAgainst,
    result:
      goalsFor > goalsAgainst ? "W" :
      goalsFor < goalsAgainst ? "L" : "D"
  });

  if (bucket.length > 15) bucket.shift();

  history.last_update = new Date().toISOString();

  await env.prebetpro_kv.put(key, JSON.stringify(history));
}

/* =========================
   JSON RESPONSE
========================= */
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
