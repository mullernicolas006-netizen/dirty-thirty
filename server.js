/**
 * DIRTY THIRTY - Backend Proxy Server
 * 
 * Why this exists:
 * ESPN's unofficial API blocks browser requests (CORS).
 * This server runs on your machine, fetches ESPN data server-side,
 * and forwards it to the React frontend with CORS headers.
 * 
 * Start with: node server.js
 * Runs on: http://localhost:3001
 */

const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
const PORT = 3001;

// ESPN API base URLs
const ESPN_NCAAB = "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball";
const ESPN_STATS = "https://site.web.api.espn.com/apis/common/v3/sports/basketball/mens-college-basketball";

// Allow all origins (your React dev server)
app.use(cors());
app.use(express.json());

// ESPN fetch helper with timeout + proper headers
async function espnFetch(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DirtyThirty/1.0)",
        "Accept": "application/json",
      },
    });
    if (!res.ok) throw new Error(`ESPN returned ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

// ─────────────────────────────────────────
// ROUTE 1: Today's NCAA Tournament Games
// GET /api/games?date=YYYYMMDD
// ─────────────────────────────────────────
app.get("/api/games", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10).replace(/-/g, "");
    // groups=100 = NCAA Tournament (March Madness bracket)
    const url = `${ESPN_NCAAB}/scoreboard?dates=${date}&groups=100&limit=50`;
    console.log(`[Games] Fetching: ${url}`);
    const data = await espnFetch(url);
    res.json({ success: true, data });
  } catch (err) {
    console.error("[Games] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 2: Live Box Score for a specific game
// GET /api/boxscore/:gameId
// Returns player-level points for the game
// ─────────────────────────────────────────
app.get("/api/boxscore/:gameId", async (req, res) => {
  try {
    const url = `${ESPN_NCAAB}/summary?event=${req.params.gameId}`;
    console.log(`[Boxscore] Fetching: ${url}`);
    const data = await espnFetch(url);

    // Extract players from boxscore
    const players = [];
    const boxscore = data.boxscore;

    if (boxscore?.players) {
      for (const teamData of boxscore.players) {
        const teamAbbr = teamData.team?.abbreviation;
        const teamName = teamData.team?.displayName;

        for (const statGroup of (teamData.statistics || [])) {
          for (const athlete of (statGroup.athletes || [])) {
            const stats = athlete.stats || [];
            // ESPN box score stat order for basketball:
            // [MIN, FG, 3PT, FT, OREB, DREB, REB, AST, STL, BLK, TO, PF, +/-, PTS]
            const ptsIndex = statGroup.keys?.indexOf("PTS") ?? 13;
            const points = parseInt(stats[ptsIndex]) || 0;

            players.push({
              id: athlete.athlete?.id,
              name: athlete.athlete?.displayName,
              shortName: athlete.athlete?.shortName,
              headshot: athlete.athlete?.headshot?.href || null,
              position: athlete.athlete?.position?.abbreviation || "—",
              team: teamAbbr,
              teamFull: teamName,
              points,
              active: athlete.active !== false,
              starter: athlete.starter || false,
              stats: stats,
              statKeys: statGroup.keys || [],
            });
          }
        }
      }
    }

    res.json({
      success: true,
      gameId: req.params.gameId,
      status: data.header?.competitions?.[0]?.status?.type?.name,
      clock: data.header?.competitions?.[0]?.status?.displayClock,
      period: data.header?.competitions?.[0]?.status?.period,
      players,
    });
  } catch (err) {
    console.error("[Boxscore] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 3: Season Averages (PPG) by Team
// GET /api/stats/:teamId
// ─────────────────────────────────────────
app.get("/api/stats/:teamId", async (req, res) => {
  try {
    const url = `${ESPN_NCAAB}/teams/${req.params.teamId}/athletes/statistics`;
    console.log(`[Stats] Fetching: ${url}`);
    const data = await espnFetch(url);

    const players = [];
    for (const entry of (data.athletes || [])) {
      const athlete = entry.athlete;
      const stats = entry.statistics?.[0]; // season averages
      const categories = stats?.splits?.categories || [];

      let avgPoints = null;
      for (const cat of categories) {
        if (cat.name === "scoring" || cat.displayName === "Scoring") {
          const ptsStat = cat.stats?.find(s => s.abbreviation === "PTS" || s.name === "avgPoints");
          if (ptsStat) avgPoints = parseFloat(ptsStat.displayValue) || null;
        }
      }

      if (avgPoints === null) {
        // Try flat stats array
        for (const cat of categories) {
          const ptsStat = cat.stats?.find(s =>
            s.abbreviation === "PTS" ||
            s.name === "avgPoints" ||
            s.displayName === "PPG"
          );
          if (ptsStat) { avgPoints = parseFloat(ptsStat.displayValue) || null; break; }
        }
      }

      players.push({
        id: athlete?.id,
        name: athlete?.displayName,
        avgPoints,
      });
    }

    res.json({ success: true, players });
  } catch (err) {
    console.error("[Stats] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 4: Global player stats (scoring leaders)
// GET /api/stats/leaders?limit=500
// Returns top scorers across all teams
// ─────────────────────────────────────────
app.get("/api/stats/leaders", async (req, res) => {
  try {
    const limit = req.query.limit || 500;
    // Get scoring leaders, sorted by PPG descending
    const url = `${ESPN_STATS}/statistics/byathlete?isqualified=true&page=1&limit=${limit}&sort=offensive.avgPoints:desc`;
    console.log(`[Leaders] Fetching: ${url}`);
    const data = await espnFetch(url);

    const players = {};
    for (const entry of (data.athletes || [])) {
      const athlete = entry.athlete;
      const categories = entry.statistics?.splits?.categories || [];

      let avgPoints = null;
      for (const cat of categories) {
        const ptsStat = cat.stats?.find(s =>
          s.name === "avgPoints" ||
          s.abbreviation === "PTS"
        );
        if (ptsStat) { avgPoints = parseFloat(ptsStat.displayValue); break; }
      }

      if (athlete?.id) {
        players[athlete.id] = { avgPoints };
      }
    }

    res.json({ success: true, players });
  } catch (err) {
    console.error("[Leaders] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 5: Full player list for today's games
// GET /api/today-players
// Combines scoreboard + rosters + season averages
// ─────────────────────────────────────────
app.get("/api/today-players", async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10).replace(/-/g, "");
    
    // Step 1: Get today's games
    const scoreboardUrl = `${ESPN_NCAAB}/scoreboard?dates=${date}&groups=100&limit=50`;
    console.log(`[TodayPlayers] Scoreboard: ${scoreboardUrl}`);
    const scoreboardData = await espnFetch(scoreboardUrl);
    const events = scoreboardData.events || [];

    if (events.length === 0) {
      return res.json({ success: true, games: [], players: [], message: "No games today" });
    }

    // Step 2: For each game, get team IDs
    const teamIds = new Set();
    const gameMap = {};

    for (const event of events) {
      const comp = event.competitions?.[0];
      const status = comp?.status?.type?.name;
      
      gameMap[event.id] = {
        id: event.id,
        date: event.date,
        name: event.name,
        status,
        statusDetail: comp?.status?.type?.detail,
        clock: comp?.status?.displayClock,
        period: comp?.status?.period,
        teams: [],
      };

      for (const competitor of (comp?.competitors || [])) {
        const teamId = competitor.team?.id;
        if (teamId) {
          teamIds.add(teamId);
          gameMap[event.id].teams.push({
            id: teamId,
            abbr: competitor.team?.abbreviation,
            name: competitor.team?.displayName,
            logo: competitor.team?.logo,
            score: competitor.score,
          });
        }
      }
    }

    // Step 3: Fetch rosters for all teams in parallel
    console.log(`[TodayPlayers] Fetching rosters for ${teamIds.size} teams`);
    const rosterPromises = Array.from(teamIds).map(async (teamId) => {
      try {
        const url = `${ESPN_NCAAB}/teams/${teamId}/roster`;
        const data = await espnFetch(url);
        return { teamId, athletes: data.athletes || [] };
      } catch {
        return { teamId, athletes: [] };
      }
    });

    const rosters = await Promise.allSettled(rosterPromises);

    // Step 4: Fetch season stats for all teams in parallel
    console.log(`[TodayPlayers] Fetching stats for ${teamIds.size} teams`);
    const statsPromises = Array.from(teamIds).map(async (teamId) => {
      try {
        const url = `${ESPN_NCAAB}/teams/${teamId}/athletes/statistics`;
        const data = await espnFetch(url);
        const statsMap = {};
        for (const entry of (data.athletes || [])) {
          const id = entry.athlete?.id;
          const categories = entry.statistics?.splits?.categories || [];
          let avgPoints = null;
          for (const cat of categories) {
            const ptsStat = cat.stats?.find(s =>
              s.name === "avgPoints" || s.abbreviation === "PTS"
            );
            if (ptsStat) { avgPoints = parseFloat(ptsStat.displayValue) || null; break; }
          }
          if (id) statsMap[id] = { avgPoints };
        }
        return { teamId, statsMap };
      } catch {
        return { teamId, statsMap: {} };
      }
    });

    const statsResults = await Promise.allSettled(statsPromises);

    // Build combined stats lookup
    const globalStats = {};
    for (const result of statsResults) {
      if (result.status === "fulfilled") {
        Object.assign(globalStats, result.value.statsMap);
      }
    }

    // Build team → game mapping
    const teamGameMap = {};
    for (const [gameId, game] of Object.entries(gameMap)) {
      for (const team of game.teams) {
        teamGameMap[team.id] = { gameId, ...game };
      }
    }

    // Step 5: Assemble full player list
    const players = [];

    for (const result of rosters) {
      if (result.status !== "fulfilled") continue;
      const { teamId, athletes } = result.value;

      // Find which game and team data
      const gameInfo = teamGameMap[teamId];
      if (!gameInfo) continue;

      const teamData = gameInfo.teams.find(t => t.id == teamId);
      const gameStatus = gameInfo.status;
      const gameStart = new Date(gameInfo.date);
      const now = new Date();

      const isLocked = now >= gameStart;
      const isLive = gameStatus === "STATUS_IN_PROGRESS";
      const isOver = gameStatus === "STATUS_FINAL";

      const matchup = gameInfo.teams.map(t => t.abbr).join(" vs ");

      for (const athlete of athletes) {
        const id = athlete.id;
        const statsEntry = globalStats[id] || {};

        players.push({
          id: `${gameInfo.gameId}_${id}`,
          espnId: id,
          name: athlete.displayName || athlete.fullName,
          shortName: athlete.shortName,
          headshot: athlete.headshot?.href || `https://a.espncdn.com/i/headshots/mens-college-basketball/players/full/${id}.png`,
          position: athlete.position?.abbreviation || "G",
          jersey: athlete.jersey,
          team: teamData?.abbr || "—",
          teamFull: teamData?.name || "—",
          teamLogo: teamData?.logo,
          matchup,
          gameId: gameInfo.gameId,
          gameStart,
          isLocked,
          isLive,
          isOver,
          points: null, // filled by box score polling
          avgPoints: statsEntry.avgPoints ?? null,
        });
      }
    }

    res.json({
      success: true,
      date,
      games: Object.values(gameMap),
      players,
      teamCount: teamIds.size,
    });

  } catch (err) {
    console.error("[TodayPlayers] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// ROUTE 6: All live scores for today's games
// GET /api/live-scores?games=id1,id2,...
// ─────────────────────────────────────────
app.get("/api/live-scores", async (req, res) => {
  try {
    const gameIds = (req.query.games || "").split(",").filter(Boolean);
    
    if (gameIds.length === 0) {
      return res.json({ success: true, scores: {} });
    }

    const results = await Promise.allSettled(
      gameIds.map(async (gameId) => {
        const url = `${ESPN_NCAAB}/summary?event=${gameId}`;
        const data = await espnFetch(url);
        const players = {};
        
        const boxscore = data.boxscore;
        if (boxscore?.players) {
          for (const teamData of boxscore.players) {
            for (const statGroup of (teamData.statistics || [])) {
              const ptsIndex = statGroup.keys?.indexOf("PTS") ?? 13;
              for (const athlete of (statGroup.athletes || [])) {
                const pts = parseInt(athlete.stats?.[ptsIndex]) || 0;
                players[athlete.athlete?.id] = pts;
              }
            }
          }
        }

        return {
          gameId,
          status: data.header?.competitions?.[0]?.status?.type?.name,
          clock: data.header?.competitions?.[0]?.status?.displayClock,
          period: data.header?.competitions?.[0]?.status?.period,
          players,
        };
      })
    );

    const scores = {};
    for (const result of results) {
      if (result.status === "fulfilled") {
        scores[result.value.gameId] = result.value;
      }
    }

    res.json({ success: true, scores });
  } catch (err) {
    console.error("[LiveScores] Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get("/api/health", (_, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🔥 DIRTY THIRTY Backend running on http://localhost:${PORT}`);
  console.log(`   Endpoints:`);
  console.log(`   GET /api/today-players  — All players for today's March Madness games`);
  console.log(`   GET /api/live-scores    — Live box scores (call every 60s)`);
  console.log(`   GET /api/boxscore/:id   — Single game box score`);
  console.log(`   GET /api/games          — Today's scoreboard\n`);
});
