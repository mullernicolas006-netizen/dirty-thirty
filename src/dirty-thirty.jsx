import { useState, useEffect, useRef } from "react";

const API = "https://dirty-thirty.onrender.com/api";
const REFRESH_INTERVAL = 60000;
const LOGO = "data:image/webp;base64,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";

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

function validateEmail(email) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email);
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
    if (!name.trim()) return setErr("Name is required");
    if (!email.trim()) return setErr("Email is required");
    if (!validateEmail(email.trim())) return setErr("Bitte gib eine valid email address ein (z.B. name@domain.com)");
    
    setLoading(true);
    const id = `user_${email.replace(/[^a-z0-9]/gi, "_").toLowerCase()}`;
    const user = { id, name: name.trim(), email: email.trim().toLowerCase(), joined: Date.now() };
    
    // Save to shared storage so admin can see all users
    await store.set(`users:${id}`, user);
    await store.set(`user_emails:${email.trim().toLowerCase()}`, { userId: id, name: name.trim(), email: email.trim().toLowerCase(), joined: Date.now() });
    
    localStorage.setItem("d30_user", JSON.stringify(user));
    onLogin(user);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.bg }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 65%)`, top: "50%", left: "50%", transform: "translate(-50%,-50%)", pointerEvents: "none" }} />
        <div className="fu" style={{ width: "100%", maxWidth: 400, position: "relative" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#ff3d00", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={LOGO} alt="BeatM Logo" style={{ width: 38, height: 38, objectFit: "contain", filter: "brightness(0) invert(1)" }} /></div>
              <span style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 15, color: "#eef0f4", letterSpacing: 0.5 }}>by BeatM</span>
            </div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 84, lineHeight: 0.88, letterSpacing: -1 }}>
              <div style={{ color: C.text }}>DIRTY</div>
              <div style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THIRTY</div>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted, letterSpacing: 3, marginTop: 14 }}>MARCH MADNESS 2026 · DAILY FANTASY</div>
          </div>

          <div style={{ background: C.goldDim, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: "13px 18px", marginBottom: 20 }}>
            <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.gold, lineHeight: 1.9, letterSpacing: 0.3 }}>
              🏀 Pick 2 Players · Kombinierte Punkte = 30<br/>
              🎯 Closest to 30 wins<br/>
              💥 Over 30 = Bust → you lose
            </p>
          </div>

          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
            {[["name", "text", "Your Name"], ["email", "email", "deine@email.com"]].map(([field, type, ph]) => (
              <div key={field} style={{ marginBottom: field === "name" ? 16 : 22 }}>
                <label style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, letterSpacing: 2, display: "block", marginBottom: 7 }}>{field.toUpperCase()}</label>
                <input type={type} placeholder={ph}
                  value={field === "name" ? name : email}
                  onChange={e => { field === "name" ? setName(e.target.value) : setEmail(e.target.value); setErr(""); }}
                  onKeyDown={e => e.key === "Enter" && submit()}
                  style={{ width: "100%", padding: "11px 14px", background: C.surface, border: `1px solid ${err && ((field === "email" && err.toLowerCase().includes("mail")) || (field === "name" && err.toLowerCase().includes("name"))) ? C.red : C.border}`, borderRadius: 8, color: C.text, fontSize: 14 }}
                />
              </div>
            ))}
            {err && <p style={{ color: C.red, fontFamily: "'JetBrains Mono'", fontSize: 11, marginBottom: 14, lineHeight: 1.5 }}>⚠ {err}</p>}
            <button onClick={submit} disabled={loading} style={{ width: "100%", padding: 13, background: C.accent, border: "none", borderRadius: 8, color: "#fff", fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 22, letterSpacing: 3, cursor: "pointer", animation: "glow 2s infinite" }}>
              {loading ? "..." : "LET'S PLAY"}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ── FOOTER ────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`, padding: "16px 24px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
      background: C.bg,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#ff3d00", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={LOGO} alt="BeatM" style={{ width: 16, height: 16, objectFit: "contain", filter: "brightness(0) invert(1)" }} /></div>
        <span style={{ fontFamily: "'JetBrains Mono'", fontWeight: 600, fontSize: 10, color: "#eef0f4", letterSpacing: 1 }}>by BeatM</span>
      </div>
      <span style={{ color: C.border }}>·</span>
      <a href="https://beatm.org" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, letterSpacing: 1, textDecoration: "none", borderBottom: `1px solid ${C.muted}44` }}>
        beatm.org
      </a>
      <span style={{ color: C.border }}>·</span>
      <span style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, letterSpacing: 1 }}>MARCH MADNESS 2026</span>
    </footer>
  );
}

// ── HEADER ────────────────────────────────────────────────────────
function Header({ tab, setTab, user, liveCount }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 100, background: `${C.bg}f2`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#ff3d00", display: "flex", alignItems: "center", justifyContent: "center" }}><img src={LOGO} alt="BeatM" style={{ width: 22, height: 22, objectFit: "contain", filter: "brightness(0) invert(1)" }} /></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 22, color: C.accent }}>DIRTY</span>
            <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 900, fontSize: 22, background: `linear-gradient(90deg,${C.gold},${C.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>THIRTY</span>
          </div>
          {liveCount > 0 && <span style={{ marginLeft: 4 }}><Badge label={`${liveCount} LIVE`} color={C.green} blink /></span>}
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
        {player.headshot ? <img src={player.headshot} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} /> : <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 13, color: C.muted }}>{player.position}</span>}
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
        {player.points !== null && <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 24, color: C.gold, lineHeight: 1 }}>{player.points}<span style={{ fontSize: 9, fontFamily: "'JetBrains Mono'", color: C.muted, fontWeight: 400 }}> pts</span></div>}
        {player.avgPoints !== null && <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 9, color: C.muted, marginTop: 1 }}>⌀ {player.avgPoints.toFixed(1)} ppg</div>}
        <div style={{ marginTop: 3 }}><Badge label={statusLabel} color={statusColor} blink={player.isLive} /></div>
      </div>
    </div>
  );
}

// ── PICK SCREEN ───────────────────────────────────────────────────
function PickScreen({ user, players, picks, setPicks, loading, error, nextGameDate }) {
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
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 3 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
          {nextGameDate && <span style={{ color: C.orange, marginLeft: 8 }}>· NÄCHSTE SPIELE: {nextGameDate}</span>}
        </p>
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
                  <div style={{ fontFamily: "'Inter'", fontWeight: 600, fontSize: 13, color: pick ? C.text : C.muted }}>{pick ? pick.name : "— Not selected"}</div>
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
            {total !== null ? isBust ? "💥 BUST!" : total === 30 ? "🎯 PERFECT!" : `${30 - total} FROM 30` : "/ 30"}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: `${C.red}11`, border: `1px solid ${C.red}44`, borderRadius: 10, padding: "11px 16px", marginBottom: 18, fontFamily: "'JetBrains Mono'", fontSize: 11, color: C.red }}>
          ⚠ Backend nicht erreichbar — bitte versuche es in einem Moment erneut.
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players..." style={{ flex: 1, minWidth: 160, padding: "7px 12px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 13 }} />
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
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: C.muted, fontFamily: "'JetBrains Mono'", fontSize: 11 }}>
              {error ? "BACKEND NICHT ERREICHBAR" : (
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>🏀</div>
                  <div style={{ color: C.muted, marginBottom: 8 }}>KEINE SPIELE HEUTE</div>
                  <div style={{ color: C.subtle, fontSize: 10, marginTop: 4 }}>MARCH MADNESS 2026 STARTET IM MÄRZ</div>
                  <div style={{ color: C.subtle, fontSize: 10, marginTop: 4 }}>SPIELER WERDEN AUTOMATISCH ANGEZEIGT SOBALD DAS BRACKET FESTSTEHT</div>
                </div>
              )}
            </div>
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
        <p style={{ fontFamily: "'JetBrains Mono'", fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 3 }}>{ranked.length} PLAYERS TODAY</p>
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
                  {isBust ? <span style={{ color: C.red }}>💥 BUST</span> : isPerfect ? <span style={{ color: C.gold }}>🎯 PERFECT</span> : delta !== null ? <span style={{ color: C.muted }}>{delta} VON 30</span> : <span style={{ color: C.muted }}>PENDING</span>}
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
  const [nextGameDate, setNextGameDate] = useState(null);
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
      // Try today first
      let res = await apiFetch("/today-players");
      
      // If no games today, try next 30 days to find upcoming March Madness games
      if (res.success && res.players.length === 0) {
        for (let i = 1; i <= 30; i++) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + i);
          const dateStr = nextDate.toISOString().slice(0, 10).replace(/-/g, "");
          const nextRes = await apiFetch(`/today-players?date=${dateStr}`);
          if (nextRes.success && nextRes.players.length > 0) {
            // Found upcoming games — show players but mark them all as not locked
            const dateLabel = nextDate.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
            setNextGameDate(dateLabel.toUpperCase());
            res = nextRes;
            break;
          }
        }
      }

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
    const { keys } = await store.list("picks:");
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
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
        <Header tab={tab} setTab={setTab} user={user} liveCount={liveCount} />
        <div style={{ flex: 1 }}>
          {tab === "pick" && <PickScreen user={user} players={players} picks={picks} setPicks={setPicks} loading={loadingPlayers} error={apiError} nextGameDate={nextGameDate} />}
          {tab === "leaderboard" && <LeaderboardScreen entries={leaderboard} userId={user.id} />}
          {tab === "results" && <ResultsScreen entries={leaderboard} />}
        </div>
        <Footer />
      </div>
    </>
  );
}
