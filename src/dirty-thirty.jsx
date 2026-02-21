import { useState, useEffect, useRef } from "react";

const API = "https://dirty-thirty.onrender.com/api";
const REFRESH_INTERVAL = 60000;

const C = {
  bg: "#07070d", surface: "#0f0f1a", card: "#12121f", cardHover: "#181828",
  border: "#1c1c30", accent: "#ff3d00", accentDim: "rgba(255,61,0,0.15)",
  accentGlow: "rgba(255,61,0,0.25)", gold: "#ffd600", goldDim: "rgba(255,214,0,0.12)",
  green: "#00e676", red: "#ff1744", orange: "#ff9100",
  text: "#eef0f4", muted: "#5a6070", subtle: "#2a2a42",
};

const store = {
  async get(key) { try { return await window.storage.get(key, true); } catch { return null; } },
  async set(key, value) { try { return await window.storage.set(key, JSON.stringify(value), true); } catch {} },
  async list(prefix) { try { return await window.storage.list(prefix, true); } catch { return { keys: [] }; } },
};

async function apiFetch(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function scoreDelta(score) { if (score === null || score > 30) return null; return 30 - score; }
function rankEntries(entries) {
  const valid = entries.filter(e => e.total !== null && e.total <= 30);
  const busts = entries.filter(e => e.total !== null && e.total > 30);
  const pending = entries.filter(e => e.total === null);
  valid.sort((a, b) => scoreDelta(a.total) - scoreDelta(b.total));
  return [...valid, ...busts, ...pending];
}

function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', sans-serif; }
      input, button { font-family: inherit; } input::placeholder { color: ${C.muted}; } input:focus { outline: none; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
      @keyframes spin { to { transform:rotate(360deg); } }
      @keyframes glow { 0%,100% { box-shadow:0 0 0 0 ${C.accentGlow}; } 50% { box-shadow:0 0 20px 6px ${C.accentGlow}; } }
      .fu { animation: fadeUp 0.35s ease both; }
      .blink { animation: pulse 1.2s infinite; }
      .spin { animation: spin 0.8s linear infinite; }
    `}</style>
  );
}

function Spinner({ size = 24 }) {
  return <div className="spin" style={{ width: size, height: size, borderRadius: "50%", border: `2px solid ${C.border}`, borderTopColor: C.accent }} />;
}

function Badge({ label, color = C.muted, blink = false }) {
  return (
    <span className={blink ? "blink" : ""} style={{
      fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: 1.5, color,
      padding: "2px 7px", borderRadius: 4, border: `1px solid ${color}44`, background: `${color}0d`,
    }}>{label}</span>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!name.trim() || !email.trim()) return setErr("Name & E-Mail erforderlich");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setErr("Ungültige E-Mail");
    setLoading(true);
    const id = `user_${email.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
    const user = { id, name: name.trim(), email: email.trim(), joined: Date.now() };
    await store.set(`users:${id}`, user);
    localStorage.setItem("d30_user", JSON.stringify(user));
    onLogin(user);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
      <div className="fu" style={{ width: "100%", maxWidth: 400, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 84, lineHeight: 0.88, letterSpacing: -1 }}>
            <div style={{ color: C.text }}>DIRTY</div>
            <div style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THIRTY</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted, letterSpacing: 3, marginTop: 14 }}>MARCH MADNESS · DAILY FANTASY</div>
        </div>

        <div style={{ background: C.goldDim, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "13px 18px", marginBottom: 20 }}>
          <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.gold, lineHeight: 1.9, letterSpacing: 0.3 }}>
            🏀 Pick 2 Spieler · Kombinierte Punkte = 30<br/>
            🎯 Wer am nächsten zu 30 kommt, gewinnt<br/>
            💥 Über 30 = Bust → du verlierst
          </p>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
          {[["name", "text", "Dein Name"], ["email", "email", "deine@email.de"]].map(([field, type, ph]) => (
            <div key={field} style={{ marginBottom: field === "name" ? 16 : 22 }}>
              <label style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, letterSpacing: 2, display: "block", marginBottom: 7 }}>{field.toUpperCase()}</label>
              <input type={type} placeholder={ph}
                value={field === "name" ? name : email}
                onChange={e => field === "name" ? setName(e.target.value) : setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 14 }}
              />
            </div>
          ))}
          {err && <p style={{ color: C.red, fontFamily: "'JetBrains Mono'", fontSize: 11, marginBottom: 14 }}>{err}</p>}
          <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 13, background: C.accent, border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 22, letterSpacing: 3, cursor: "pointer", animation: "glow 2s infinite" }}>
            {loading ? "..." : "LET'S PLAY"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── HEADER ────────────────────────────────────────────────────────
function Header({ tab, setTab, user, liveCount }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: `${C.bg}f2`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 24, color: C.accent }}>DIRTY</span>
          <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 24, background: `linear-gradient(90deg,${C.gold},${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THIRTY</span>
          {liveCount > 0 && <span style={{ marginLeft: 6 }}><Badge label={`${liveCount} LIVE`} color={C.green} blink /></span>}
        </div>
        <nav style={{ display: "flex", gap: 2 }}>
          {[["pick","PICK"],["leaderboard","BOARD"],["results","RESULTS"]].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono'", fontSize: 10, letterSpacing: 1, background: tab===t ? `${C.accent}22` : "transparent", color: tab===t ? C.accent : C.muted, borderBottom: `2px solid ${tab===t ? C.accent : "transparent"}` }}>{l}</button>
          ))}
        </nav>
        <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted }}>{user.name}</div>
      </div>
    </header>
  );
}

// ── PLAYER CARD ───────────────────────────────────────────────────
function PlayerCard({ player, selected, onToggle, disabled }) {
  const [hov, setHov] = useState(false);
  const canSelect = !player.isLocked && (!disabled || selected);

  const statusLabel = player.isOver ? "FINAL" : player.isLive ? "LIVE" : player.isLocked ? "LOCKED" : "UPCOMING";
  const statusColor = player.isOver ? C.muted : player.isLive ? C.green : player.isLocked ? C.red : C.orange;

  return (
    <div onClick={() => canSelect && onToggle(player)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: selected ? C.accentDim : hov && canSelect ? C.cardHover : C.card, border: `1px solid ${selected ? C.accent : hov && canSelect ? C.subtle : C.border}`, borderRadius: 10, padding: "11px 14px", cursor: canSelect ? "pointer" : "not-allowed", opacity: player.isLocked && !selected ? 0.45 : 1, transition: "all 0.13s", display: "flex", gap: 11, alignItems: "center", position: "relative" }}>
      {selected && <div style={{ position: "absolute", left: 0, top: "18%", bottom: "18%", width: 3, background: C.accent, borderRadius: "0 2px 2px 0" }} />}
      <div style={{ width: 42, height: 42, borderRadius: 8, flexShrink: 0, overflow: "hidden", background: C.subtle, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {player.headshot
          ? <img src={player.headshot} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
          : <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13, color: C.muted }}>{player.position}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
        <div style={{ display: "flex", gap: 5, marginTop: 3, alignItems: "center" }}>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted }}>{player.team}</span>
          <span style={{ color: C.border }}>·</span>
          <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted }}>{player.position}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        {player.points !== null && (
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 24, color: C.gold, lineHeight: 1 }}>
            {player.points}<span style={{ fontSize: 9, fontFamily: "'JetBrains Mono'", color: C.muted, fontWeight: 400 }}> pts</span>
          </div>
        )}
        {player.avgPoints !== null && (
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, marginTop: 1 }}>⌀ {player.avgPoints.toFixed(1)} ppg</div>
        )}
        <div style={{ marginTop: 3 }}><Badge label={statusLabel} color={statusColor} blink={player.isLive} /></div>
      </div>
    </div>
  );
}

// ── PICK SCREEN ───────────────────────────────────────────────────
function PickScreen({ user, players, picks, setPicks, loading, error }) {
  const [search, setSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState("ALL");

  const pick1 = picks[0], pick2 = picks[1];
  const bothPicked = pick1 && pick2;
  const total = bothPicked && pick1.points !== null && pick2.points !== null ? pick1.points + pick2.points : null;
  const isBust = total !== null && total > 30;
  const isLive = pick1?.isLive || pick2?.isLive;
  const teams = ["ALL", ...new Set(players.map(p => p.team).filter(Boolean).sort())];
  const filtered = players.filter(p => (teamFilter === "ALL" || p.team === teamFilter) && (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.team.toLowerCase().includes(search.toLowerCase())));

  function toggle(player) {
    if (picks.some(p => p?.id === player.id)) { setPicks(prev => prev.map(p => p?.id === player.id ? null : p)); return; }
    const slot = picks.findIndex(p => p === null);
    if (slot === -1) return;
    const next = [...picks]; next[slot] = player; setPicks(next);
  }

  const scoreColor = total === null ? C.muted : isBust ? C.red : total === 30 ? C.gold : C.green;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px" }}>
      <div className="fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 38, letterSpacing: 1 }}>TODAY'S <span style={{ color: C.accent }}>PICKS</span></h1>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 3 }}>{new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}</p>
      </div>

      {/* Score card */}
      <div className="fu" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px", marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {[0, 1].map(i => {
            const pick = picks[i];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 46, height: 46, borderRadius: 10, border: `2px ${pick ? "solid" : "dashed"} ${pick ? C.accent : C.border}`, background: pick ? C.accentDim : "transparent", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {pick?.headshot ? <img src={pick.headshot} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: pick ? C.accent : C.muted }}>P{i + 1}</span>}
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 13, color: pick ? C.text : C.muted }}>{pick ? pick.name : "— Nicht gewählt"}</div>
                  {pick && (
                    <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 3 }}>
                      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted }}>{pick.team}</span>
                      {pick.avgPoints !== null && <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted }}>⌀ {pick.avgPoints.toFixed(1)} ppg</span>}
                      <button onClick={() => setPicks(prev => prev.map((p, idx) => idx === i ? null : p))} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontFamily: "'JetBrains Mono'", fontSize: 9 }}>✕</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center" }}>
          {isLive && <Badge label="LIVE" color={C.green} blink />}
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 60, lineHeight: 1, color: scoreColor, marginTop: 2 }}>{total !== null ? total : "—"}</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: scoreColor, letterSpacing: 1, marginTop: 1 }}>
            {total !== null ? isBust ? "💥 BUST!" : total === 30 ? "🎯 PERFECT!" : `${30 - total} VOM ZIEL` : "/ 30"}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: `${C.red}11`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: "11px 16px", marginBottom: 18, fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.red }}>
          ⚠ Backend nicht erreichbar — stelle sicher dass <strong>node server.js</strong> läuft (localhost:3001)
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Spieler suchen..." style={{ flex: 1, minWidth: 160, padding: "7px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13 }} />
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {teams.map(t => (
            <button key={t} onClick={() => setTeamFilter(t)} style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${teamFilter === t ? C.accent : C.border}`, background: teamFilter === t ? C.accentDim : "transparent", color: teamFilter === t ? C.accent : C.muted, fontFamily: "'JetBrains Mono'", fontSize: 9, letterSpacing: 1, cursor: "pointer" }}>{t}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size={32} /></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))", gap: 7 }}>
          {filtered.map((p, i) => (
            <div key={p.id} className="fu" style={{ animationDelay: `${i * 0.018}s` }}>
              <PlayerCard player={p} selected={picks.some(pp => pp?.id === p.id)} onToggle={toggle} disabled={picks.filter(Boolean).length >= 2} />
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: C.muted, fontFamily: "'JetBrains Mono'", fontSize: 11 }}>KEINE SPIELER VERFÜGBAR</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────────────
function LeaderboardScreen({ entries, userId }) {
  const ranked = rankEntries(entries);
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px" }}>
      <div className="fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 38, letterSpacing: 1 }}>LEADER<span style={{ color: C.accent }}>BOARD</span></h1>
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 3 }}>{ranked.length} SPIELER HEUTE</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ranked.map((entry, idx) => {
          const isMe = entry.userId === userId;
          const isBust = entry.total !== null && entry.total > 30;
          const isPerfect = entry.total === 30;
          const delta = scoreDelta(entry.total);
          const medals = ["🥇","🥈","🥉"];
          return (
            <div key={entry.userId} className="fu" style={{ animationDelay: `${idx * 0.025}s`, background: isMe ? C.accentDim : C.card, border: `1px solid ${isMe ? C.accent : C.border}`, borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 34, textAlign: "center" }}>
                {medals[idx] && !isBust ? <span style={{ fontSize: 19 }}>{medals[idx]}</span> : <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 17, color: C.muted }}>#{idx+1}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 14, color: isMe ? C.accent : C.text }}>{entry.userName}{isMe && <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, marginLeft: 7 }}>(DU)</span>}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, marginTop: 3 }}>{entry.p1Name ? `${entry.p1Name} (${entry.p1pts ?? "?"}) + ${entry.p2Name ?? "—"} (${entry.p2pts ?? "?"})` : "Noch keine Picks"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 28, lineHeight: 1, color: isBust ? C.red : isPerfect ? C.gold : entry.total !== null ? C.green : C.muted }}>{entry.total ?? "—"}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, marginTop: 2, letterSpacing: 1 }}>
                  {isBust ? <span style={{ color: C.red }}>💥 BUST</span> : isPerfect ? <span style={{ color: C.gold }}>🎯 PERFECT</span> : delta !== null ? <span style={{ color: C.muted }}>{delta} VON 30</span> : <span style={{ color: C.muted }}>AUSSTEHEND</span>}
                </div>
              </div>
            </div>
          );
        })}
        {ranked.length === 0 && <div style={{ textAlign: "center", padding: 80, color: C.muted, fontFamily: "'JetBrains Mono'", fontSize: 11 }}>NOCH KEINE PICKS — SEI DER ERSTE!</div>}
      </div>
    </div>
  );
}

// ── RESULTS ───────────────────────────────────────────────────────
function ResultsScreen({ entries }) {
  const finished = entries.filter(e => e.total !== null);
  const ranked = rankEntries(finished);
  const winner = ranked.find(e => e.total !== null && e.total <= 30);
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px" }}>
      <div className="fu" style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 38, letterSpacing: 1 }}>FINAL <span style={{ color: C.gold }}>RESULTS</span></h1>
      </div>
      {winner ? (
        <div className="fu" style={{ background: C.goldDim, border: `1px solid ${C.gold}44`, borderRadius: 14, padding: 30, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 52, marginBottom: 6 }}>🏆</div>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 48, color: C.gold, letterSpacing: 3 }}>{winner.userName}</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.muted, marginTop: 8 }}>{winner.p1Name} ({winner.p1pts}) + {winner.p2Name} ({winner.p2pts}) = <span style={{ color: C.gold }}>{winner.total} Punkte</span></div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.gold, marginTop: 5, letterSpacing: 1 }}>{winner.total === 30 ? "🎯 PERFECT DIRTY THIRTY!" : `NUR ${30 - winner.total} PUNKTE VOM DIRTY THIRTY`}</div>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 40, textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.muted }}>GAMES NOCH NICHT BEENDET — ERGEBNISSE FOLGEN</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {ranked.map((entry, idx) => {
          const isBust = entry.total > 30, isPerfect = entry.total === 30;
          return (
            <div key={entry.userId} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 18px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 34, textAlign: "center" }}>{idx === 0 && !isBust ? <span style={{ fontSize: 19 }}>🥇</span> : <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: 17, color: C.muted }}>#{idx+1}</span>}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 14 }}>{entry.userName}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, marginTop: 3 }}>{entry.p1Name} ({entry.p1pts}) + {entry.p2Name} ({entry.p2pts})</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 28, color: isBust ? C.red : isPerfect ? C.gold : C.green }}>{entry.total}</div>
                <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: isBust ? C.red : C.muted }}>{isBust ? "💥 BUST" : isPerfect ? "🎯 PERFECT" : `${30 - entry.total} FROM 30`}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("pick");
  const [players, setPlayers] = useState([]);
  const [picks, setPicks] = useState([null, null]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [liveCount, setLiveCount] = useState(0);
  const gameIdsRef = useRef([]);

  useEffect(() => {
    const saved = localStorage.getItem("d30_user");
    if (saved) { try { setUser(JSON.parse(saved)); } catch {} }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadTodayPlayers();
    loadLeaderboard();
  }, [user]);

  useEffect(() => {
    if (!user || players.length === 0) return;
    const iv = setInterval(refreshLiveScores, REFRESH_INTERVAL);
    return () => clearInterval(iv);
  }, [user, players]);

  useEffect(() => {
    if (!user) return;
    savePicks();
    loadLeaderboard();
  }, [picks]);

  async function loadTodayPlayers() {
    setLoadingPlayers(true); setApiError(null);
    try {
      const res = await apiFetch("/today-players");
      if (!res.success) throw new Error(res.error || "Unknown");
      gameIdsRef.current = res.games.map(g => g.id);
      setLiveCount(res.games.filter(g => g.status === "STATUS_IN_PROGRESS").length);
      setPlayers(res.players);
      const saved = await store.get(`picks:${user.id}:${todayStr()}`);
      if (saved) {
        const d = JSON.parse(saved.value);
        setPicks([
          d.p1Id ? res.players.find(p => p.id === d.p1Id) || null : null,
          d.p2Id ? res.players.find(p => p.id === d.p2Id) || null : null,
        ]);
      }
      if (res.games.some(g => g.status === "STATUS_IN_PROGRESS")) await doLiveUpdate(res.players, gameIdsRef.current);
    } catch (e) { setApiError(e.message); }
    finally { setLoadingPlayers(false); }
  }

  async function refreshLiveScores() {
    if (gameIdsRef.current.length === 0) return;
    await doLiveUpdate(players, gameIdsRef.current);
  }

  async function doLiveUpdate(currentPlayers, gameIds) {
    try {
      const res = await apiFetch(`/live-scores?games=${gameIds.filter(Boolean).join(",")}`);
      if (!res.success) return;
      let live = 0;
      setPlayers(prev => prev.map(p => {
        const gs = res.scores[p.gameId]; if (!gs) return p;
        if (gs.status === "STATUS_IN_PROGRESS") live++;
        const pts = gs.players?.[p.espnId];
        return { ...p, isLive: gs.status === "STATUS_IN_PROGRESS", isOver: gs.status === "STATUS_FINAL", isLocked: gs.status !== "STATUS_SCHEDULED" || p.isLocked, points: pts !== undefined ? pts : p.points };
      }));
      setLiveCount(live);
      setPicks(prev => prev.map(pick => {
        if (!pick) return null;
        const gs = res.scores[pick.gameId]; if (!gs) return pick;
        const pts = gs.players?.[pick.espnId];
        return pts !== undefined ? { ...pick, points: pts } : pick;
      }));
    } catch (e) { console.warn("Live update failed:", e.message); }
  }

  async function savePicks() {
    if (!user) return;
    await store.set(`picks:${user.id}:${todayStr()}`, { userId: user.id, userName: user.name, p1Id: picks[0]?.id || null, p1Name: picks[0]?.name || null, p1pts: picks[0]?.points ?? null, p2Id: picks[1]?.id || null, p2Name: picks[1]?.name || null, p2pts: picks[1]?.points ?? null, updatedAt: Date.now() });
  }

  async function loadLeaderboard() {
    const dateKey = todayStr();
    const { keys } = await store.list(`picks:`);
    const entries = [];
    for (const key of keys.filter(k => k.includes(`:${dateKey}:`))) {
      try {
        const r = await store.get(key); if (!r) continue;
        const d = JSON.parse(r.value);
        const p1 = players.find(p => p.id === d.p1Id), p2 = players.find(p => p.id === d.p2Id);
        const p1pts = p1?.points ?? d.p1pts ?? null, p2pts = p2?.points ?? d.p2pts ?? null;
        entries.push({ userId: d.userId, userName: d.userName, p1Name: d.p1Name, p2Name: d.p2Name, p1pts, p2pts, total: (p1pts !== null && p2pts !== null) ? p1pts + p2pts : null });
      } catch {}
    }
    setLeaderboard(entries);
  }

  if (!user) return <><Styles /><LoginScreen onLogin={u => setUser(u)} /></>;

  return (
    <>
      <Styles />
      <div style={{ minHeight: "100vh", background: C.bg }}>
        <Header tab={tab} setTab={setTab} user={user} liveCount={liveCount} />
        {tab === "pick" && <PickScreen user={user} players={players} picks={picks} setPicks={setPicks} loading={loadingPlayers} error={apiError} />}
        {tab === "leaderboard" && <LeaderboardScreen entries={leaderboard} userId={user.id} />}
        {tab === "results" && <ResultsScreen entries={leaderboard} />}
      </div>
    </>
  );
}
// updated
