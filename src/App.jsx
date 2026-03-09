import { useState, useEffect, useRef } from "react";

const A = "#C8F135";
const DARK = "#080808";
const CARD = "#111111";
const BORDER = "#1e1e1e";
const MUTED = "#666";
const WHITE = "#f0f0f0";

const DAYS = [
  {
    id: "push", day: "MON", label: "Push", color: "#C8F135",
    focus: "Chest · Shoulders · Triceps",
    exercises: [
      { id: "bench_press", name: "Barbell Bench Press", sets: 4, reps: "6–8", rir: "2" },
      { id: "incline_db_press", name: "Incline Dumbbell Press", sets: 3, reps: "8–12", rir: "2" },
      { id: "ohp", name: "Overhead Press", sets: 4, reps: "6–10", rir: "2" },
      { id: "lateral_raise", name: "Cable Lateral Raise", sets: 4, reps: "12–20", rir: "1" },
      { id: "pushdown", name: "Tricep Rope Pushdown", sets: 3, reps: "12–15", rir: "1" },
      { id: "overhead_ext", name: "Overhead Tricep Extension", sets: 3, reps: "10–15", rir: "1" },
    ],
  },
  {
    id: "pull", day: "TUE", label: "Pull", color: "#35C8F1",
    focus: "Back · Biceps · Rear Delts",
    exercises: [
      { id: "pullup", name: "Pull-Ups / Weighted Pull-Ups", sets: 4, reps: "6–10", rir: "2" },
      { id: "bb_row", name: "Barbell Row", sets: 4, reps: "6–8", rir: "2" },
      { id: "cable_row", name: "Cable Seated Row", sets: 3, reps: "10–12", rir: "2" },
      { id: "face_pull", name: "Face Pulls", sets: 3, reps: "15–20", rir: "1" },
      { id: "incline_curl", name: "Incline DB Curl", sets: 3, reps: "10–15", rir: "1" },
      { id: "hammer_curl", name: "Hammer Curl", sets: 3, reps: "10–12", rir: "1" },
    ],
  },
  {
    id: "legs", day: "WED", label: "Legs", color: "#F1A835",
    focus: "Quads · Hamstrings · Glutes · Calves",
    exercises: [
      { id: "squat", name: "Barbell Back Squat", sets: 4, reps: "6–8", rir: "2" },
      { id: "rdl", name: "Romanian Deadlift", sets: 4, reps: "8–10", rir: "2" },
      { id: "leg_press", name: "Leg Press", sets: 3, reps: "10–15", rir: "1" },
      { id: "leg_curl", name: "Leg Curl", sets: 3, reps: "10–15", rir: "1" },
      { id: "bss", name: "Bulgarian Split Squat", sets: 3, reps: "10–12/leg", rir: "2" },
      { id: "calf_raise_s", name: "Standing Calf Raise", sets: 4, reps: "12–20", rir: "1" },
    ],
  },
  {
    id: "upper", day: "THU", label: "Upper", color: "#F135C8",
    focus: "Chest · Back · Shoulders (Volume)",
    exercises: [
      { id: "db_flat_press", name: "Dumbbell Flat Press", sets: 4, reps: "8–12", rir: "2" },
      { id: "tbar_row", name: "T-Bar Row", sets: 4, reps: "8–10", rir: "2" },
      { id: "db_ohp", name: "Dumbbell Shoulder Press", sets: 3, reps: "10–12", rir: "2" },
      { id: "cable_fly", name: "Cable Fly (low to high)", sets: 3, reps: "12–15", rir: "1" },
      { id: "lat_pulldown", name: "Lat Pulldown (neutral)", sets: 3, reps: "10–12", rir: "2" },
      { id: "ez_curl", name: "EZ Bar Curl", sets: 3, reps: "10–12", rir: "1" },
      { id: "skull_crushers", name: "Skull Crushers", sets: 3, reps: "10–12", rir: "1" },
    ],
  },
  {
    id: "lower", day: "FRI", label: "Lower", color: "#35F1A8",
    focus: "Posterior Chain · Glutes · Quads",
    exercises: [
      { id: "deadlift", name: "Deadlift", sets: 4, reps: "4–6", rir: "2–3" },
      { id: "hack_squat", name: "Hack Squat / Front Squat", sets: 3, reps: "8–10", rir: "2" },
      { id: "hip_thrust", name: "Hip Thrust (Barbell)", sets: 4, reps: "10–15", rir: "1" },
      { id: "leg_ext", name: "Leg Extension", sets: 3, reps: "15–20", rir: "1" },
      { id: "nordic_curl", name: "Nordic Curl / Seated Leg Curl", sets: 3, reps: "8–12", rir: "2" },
      { id: "calf_raise_se", name: "Seated Calf Raise", sets: 4, reps: "15–25", rir: "1" },
    ],
  },
  { id: "rest1", day: "SAT", label: "Rest", color: "#333", focus: "Active recovery", exercises: [] },
  { id: "rest2", day: "SUN", label: "Rest", color: "#333", focus: "Full rest & sleep 7–9h", exercises: [] },
];

const todayDayIndex = () => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

const dateKey = (d = new Date()) => d.toISOString().slice(0, 10);
const e1rm = (w, r) => w * (1 + r / 30);

const STORAGE_KEY = "liftlog-workout-data-v1";

function loadLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveLogs(logs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (_) {}
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = A, height = 32, width = 80 }) {
  if (!data || data.length < 2) return (
    <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#333", fontSize: 10 }}>—</span>
    </div>
  );
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 6) - 3;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const last = pts.split(" ").pop().split(",");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" opacity="0.8" />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} />
    </svg>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [nav, setNav] = useState("today");
  const [activeDay, setActiveDay] = useState(todayDayIndex());
  const [logs, setLogs] = useState(() => loadLogs());
  const [sessionDate, setSessionDate] = useState(dateKey());
  const [logModal, setLogModal] = useState(null);
  const [tempSets, setTempSets] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  // Persist on every change
  useEffect(() => { saveLogs(logs); }, [logs]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const openLogModal = (ex, color) => {
    const existing = logs[sessionDate]?.[ex.id] || [];
    const prefill = existing.length > 0
      ? existing.map(s => ({ w: String(s.w), r: String(s.r), done: true }))
      : Array.from({ length: ex.sets }, () => ({ w: "", r: "", done: false }));
    setTempSets(prefill);
    setLogModal({ exerciseId: ex.id, exerciseName: ex.name, sets: ex.sets, color });
  };

  const saveLog = () => {
    const valid = tempSets.filter(s => s.w !== "" && s.r !== "");
    if (!valid.length) { setLogModal(null); return; }

    const prevLogs = { ...logs };
    const newLogs = {
      ...prevLogs,
      [sessionDate]: {
        ...(prevLogs[sessionDate] || {}),
        [logModal.exerciseId]: valid.map(s => ({ w: parseFloat(s.w), r: parseInt(s.r), done: s.done })),
      },
    };

    // PR check
    const prevAll = Object.entries(prevLogs)
      .filter(([d]) => d !== sessionDate)
      .flatMap(([, d]) => d[logModal.exerciseId] || []);
    const prevBest = prevAll.length ? Math.max(...prevAll.map(s => e1rm(s.w, s.r))) : 0;
    const newBest = Math.max(...valid.map(s => e1rm(parseFloat(s.w), parseInt(s.r))));

    setLogs(newLogs);
    setLogModal(null);

    if (newBest > prevBest && prevBest > 0) {
      showToast("🏆 New PR on " + logModal.exerciseName + "!", "pr");
    } else {
      showToast("✓ Sets saved");
    }
  };

  const getAllSets = (exId, logData = logs) =>
    Object.values(logData).flatMap(d => d[exId] || []);

  const getSessions = (exId) =>
    Object.entries(logs)
      .filter(([, d]) => d[exId])
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, sets: d[exId] }));

  const bestE1RM = (exId) => {
    const all = getAllSets(exId);
    return all.length ? Math.max(...all.map(s => e1rm(s.w, s.r))) : null;
  };

  const lastWeight = (exId) => {
    const sessions = getSessions(exId);
    if (!sessions.length) return null;
    return Math.max(...sessions[sessions.length - 1].sets.map(s => s.w));
  };

  const sessionDone = (exId) => !!(logs[sessionDate]?.[exId]?.length);

  const currentDay = DAYS[activeDay];
  const isRestDay = currentDay.exercises.length === 0;
  const completedToday = currentDay.exercises.filter(e => sessionDone(e.id)).length;
  const totalExToday = currentDay.exercises.length;

  const historyDates = Object.keys(logs).sort((a, b) => b.localeCompare(a));
  const totalSessions = historyDates.length;

  return (
    <div style={{
      background: DARK, minHeight: "100dvh", color: WHITE,
      fontFamily: "'DM Mono', 'Courier New', monospace",
      maxWidth: 860, margin: "0 auto",
      paddingTop: "env(safe-area-inset-top)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap');
        .btn-day:hover { opacity:1 !important; }
        .ex-card:hover { border-color:#2a2a2a !important; }
        .log-btn:active { opacity:0.7; }
        @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(8px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .fade { animation: slideUp 0.22s ease; }
        .modal-wrap { position:fixed;inset:0;background:rgba(0,0,0,0.88);z-index:100;display:flex;align-items:flex-end;justify-content:center;padding:0; }
        @media(min-width:500px){ .modal-wrap { align-items:center; padding:20px; } }
        .modal { background:#111;border:1px solid #2a2a2a;border-radius:20px 20px 0 0;width:100%;max-width:460px;max-height:92dvh;overflow-y:auto;padding-bottom:env(safe-area-inset-bottom); }
        @media(min-width:500px){ .modal { border-radius:18px; } }
        .set-input { background:#0d0d0d;border:1px solid #2a2a2a;border-radius:8px;padding:11px 10px;color:${WHITE};font-family:inherit;font-size:17px;width:100%;outline:none;text-align:center;transition:border-color 0.15s; }
        .set-input:focus { border-color:${A}; }
        .set-input::placeholder { color:#333; }
      `}</style>

      {/* ── Sticky Header ── */}
      <div style={{
        padding: "16px 16px 0", position: "sticky", top: 0,
        background: DARK, zIndex: 50, borderBottom: "1px solid " + BORDER
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: 2, lineHeight: 1 }}>
              LIFT<span style={{ color: A }}>LOG</span>
            </div>
            <div style={{ fontSize: 9, color: MUTED, letterSpacing: 2, marginTop: 1 }}>PPL SCIENCE TRACKER</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[["today", "🏋️", "Today"], ["history", "📅", "History"], ["progress", "📈", "Progress"]].map(([id, icon, label]) => (
              <button key={id} onClick={() => setNav(id)} style={{
                background: nav === id ? A : "transparent",
                color: nav === id ? DARK : MUTED,
                border: "1px solid " + (nav === id ? A : BORDER),
                borderRadius: 8, padding: "7px 10px", cursor: "pointer",
                fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700, transition: "all 0.15s",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 13 }}>{icon}</span>
                <span style={{ display: window.innerWidth < 400 ? "none" : "inline" }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Day pills */}
        {nav === "today" && (
          <div style={{ display: "flex", gap: 5, paddingBottom: 14, overflowX: "auto" }}>
            {DAYS.map((d, i) => {
              const allDone = d.exercises.length > 0 && d.exercises.every(e => sessionDone(e.id));
              const partial = d.exercises.length > 0 && d.exercises.some(e => sessionDone(e.id));
              const active = activeDay === i;
              return (
                <button key={i} className="btn-day" onClick={() => setActiveDay(i)} style={{
                  flex: "0 0 auto",
                  background: active ? d.color : (partial ? d.color + "18" : "transparent"),
                  color: active ? DARK : (partial ? d.color : MUTED),
                  border: "2px solid " + (active ? d.color : partial ? d.color + "44" : BORDER),
                  borderRadius: 10, padding: "7px 12px", cursor: "pointer",
                  transition: "all 0.15s", minWidth: 52, textAlign: "center",
                  opacity: active ? 1 : 0.8,
                }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, letterSpacing: 1 }}>{d.day}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, marginTop: 1, fontFamily: "'DM Sans', sans-serif" }}>
                    {allDone ? "✓" : d.label}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: "0 16px 100px" }}>

        {/* ══ TODAY ══ */}
        {nav === "today" && (
          <div className="fade">
            <div style={{
              marginTop: 16, background: CARD, borderRadius: 14,
              border: "1px solid " + BORDER, padding: "16px 18px", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap"
            }}>
              <div style={{
                border: "2px solid " + currentDay.color, borderRadius: 9,
                padding: "5px 12px",
              }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: currentDay.color, lineHeight: 1 }}>
                  {currentDay.label}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
                  {currentDay.focus}
                </div>
                {!isRestDay && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: MUTED }}>PROGRESS</span>
                      <span style={{ fontSize: 10, color: currentDay.color, fontWeight: 600 }}>
                        {completedToday}/{totalExToday}
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        width: totalExToday ? (completedToday / totalExToday * 100) + "%" : "0%",
                        height: "100%", background: currentDay.color, borderRadius: 2,
                        transition: "width 0.4s ease"
                      }} />
                    </div>
                  </div>
                )}
              </div>
              <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)}
                style={{
                  background: "#0d0d0d", border: "1px solid " + BORDER, borderRadius: 8,
                  padding: "7px 10px", color: MUTED, fontFamily: "inherit", fontSize: 11,
                  cursor: "pointer", outline: "none",
                }} />
            </div>

            {isRestDay ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: MUTED }}>
                <div style={{ fontSize: 52 }}>💤</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, marginTop: 14, letterSpacing: 2 }}>
                  REST DAY
                </div>
                <div style={{ fontSize: 13, marginTop: 8, color: "#444" }}>{currentDay.focus}</div>
                <div style={{ fontSize: 12, marginTop: 14, color: "#333" }}>
                  Walk · Stretch · Foam roll · Hydrate
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {currentDay.exercises.map(ex => {
                  const done = sessionDone(ex.id);
                  const dayLogs = logs[sessionDate]?.[ex.id] || [];
                  const best = bestE1RM(ex.id);
                  const last = lastWeight(ex.id);
                  return (
                    <div key={ex.id} className="ex-card" style={{
                      background: CARD,
                      border: "1px solid " + (done ? currentDay.color + "55" : BORDER),
                      borderRadius: 14, padding: "15px 16px",
                      transition: "border-color 0.2s",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            {done && <span style={{ color: currentDay.color, fontSize: 13 }}>✓</span>}
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
                              {ex.name}
                            </span>
                          </div>
                          <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, color: MUTED }}>{ex.sets}×{ex.reps}</span>
                            <span style={{ fontSize: 11, color: MUTED }}>RIR {ex.rir}</span>
                            {last !== null && (
                              <span style={{ fontSize: 11, color: "#777" }}>
                                Last: <span style={{ color: WHITE }}>{last}kg</span>
                              </span>
                            )}
                            {best !== null && (
                              <span style={{ fontSize: 11, color: "#777" }}>
                                1RM: <span style={{ color: A }}>{best.toFixed(1)}kg</span>
                              </span>
                            )}
                          </div>
                          {done && dayLogs.length > 0 && (
                            <div style={{ display: "flex", gap: 5, marginTop: 9, flexWrap: "wrap" }}>
                              {dayLogs.map((s, i) => (
                                <div key={i} style={{
                                  background: currentDay.color + "20",
                                  border: "1px solid " + currentDay.color + "44",
                                  borderRadius: 6, padding: "3px 9px",
                                  fontSize: 12, color: currentDay.color,
                                  fontFamily: "'Bebas Neue', sans-serif", letterSpacing: 0.5,
                                }}>
                                  {s.w}kg×{s.r}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="log-btn" onClick={() => openLogModal(ex, currentDay.color)}
                          style={{
                            background: done ? currentDay.color + "20" : currentDay.color,
                            color: done ? currentDay.color : DARK,
                            border: "1px solid " + currentDay.color,
                            borderRadius: 9, padding: "9px 14px",
                            cursor: "pointer", fontSize: 12,
                            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                            whiteSpace: "nowrap", transition: "all 0.15s", flexShrink: 0,
                          }}>
                          {done ? "Edit" : "Log Sets"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {nav === "history" && (
          <div className="fade" style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
              {[
                ["SESSIONS", totalSessions, A],
                ["EXERCISES", Object.values(logs).reduce((s, d) => s + Object.keys(d).length, 0), "#35C8F1"],
                ["TOTAL SETS", Object.values(logs).reduce((s, d) => s + Object.values(d).reduce((s2, sets) => s2 + sets.length, 0), 0), "#F1A835"],
              ].map(([label, val, color]) => (
                <div key={label} style={{ background: CARD, borderRadius: 12, border: "1px solid " + BORDER, padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color, lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.5, marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>

            {historyDates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "50px 20px", color: MUTED }}>
                <div style={{ fontSize: 44 }}>📋</div>
                <div style={{ marginTop: 12, fontSize: 13 }}>No sessions yet. Log your first workout!</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {historyDates.map(date => {
                  const dl = logs[date];
                  const vol = Object.values(dl).reduce((s, sets) => s + sets.reduce((s2, s3) => s2 + s3.w * s3.r, 0), 0);
                  const exCount = Object.keys(dl).length;
                  const setCount = Object.values(dl).reduce((s, sets) => s + sets.length, 0);
                  const d = new Date(date + "T12:00:00");
                  return (
                    <div key={date} style={{ background: CARD, borderRadius: 14, border: "1px solid " + BORDER, padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ background: "#1a1a1a", borderRadius: 8, padding: "5px 10px", textAlign: "center", minWidth: 48 }}>
                          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: A, lineHeight: 1 }}>
                            {d.getDate()}
                          </div>
                          <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1 }}>
                            {d.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13 }}>
                            {d.toLocaleDateString("en-GB", { weekday: "long" })}
                          </div>
                          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                            {exCount} exercises · {setCount} sets · {Math.round(vol).toLocaleString()}kg vol
                          </div>
                        </div>
                        <button onClick={() => {
                          const n = { ...logs };
                          delete n[date];
                          setLogs(n);
                          showToast("Session deleted");
                        }} style={{
                          background: "transparent", border: "1px solid #2a2a2a",
                          borderRadius: 7, padding: "5px 9px", color: "#555",
                          cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                        }}>✕</button>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {Object.entries(dl).map(([exId, sets]) => {
                          const info = DAYS.flatMap(d2 => d2.exercises).find(e => e.id === exId);
                          const top = sets.reduce((best, s) => e1rm(s.w, s.r) > e1rm(best.w, best.r) ? s : best, sets[0]);
                          return (
                            <div key={exId} style={{
                              background: "#0d0d0d", border: "1px solid #1e1e1e",
                              borderRadius: 7, padding: "5px 10px", fontSize: 11,
                            }}>
                              <span style={{ color: MUTED }}>{info?.name || exId}: </span>
                              <span style={{ color: WHITE, fontWeight: 600 }}>{top.w}kg×{top.r}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══ PROGRESS ══ */}
        {nav === "progress" && (
          <div className="fade" style={{ marginTop: 16 }}>
            {DAYS.filter(d => d.exercises.length > 0).map(day => {
              const withData = day.exercises.filter(ex => getSessions(ex.id).length > 0);
              if (!withData.length) return null;
              return (
                <div key={day.id} style={{ marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{
                      background: day.color, color: DARK,
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 13, letterSpacing: 1, borderRadius: 6, padding: "3px 10px",
                    }}>{day.label}</div>
                    <div style={{ color: MUTED, fontSize: 11 }}>{day.focus}</div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 9 }}>
                    {withData.map(ex => {
                      const sessions = getSessions(ex.id);
                      const e1rms = sessions.map(s => Math.max(...s.sets.map(set => e1rm(set.w, set.r))));
                      const maxWeights = sessions.map(s => Math.max(...s.sets.map(set => set.w)));
                      const best = Math.max(...e1rms);
                      const last = e1rms[e1rms.length - 1];
                      const trend = e1rms.length > 1 ? last - e1rms[e1rms.length - 2] : 0;
                      return (
                        <div key={ex.id} style={{ background: CARD, border: "1px solid " + BORDER, borderRadius: 12, padding: "14px" }}>
                          <div style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, marginBottom: 10, lineHeight: 1.3, color: WHITE }}>
                            {ex.name}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
                            <div>
                              <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1 }}>EST. 1RM</div>
                              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: A, lineHeight: 1 }}>
                                {last.toFixed(1)}<span style={{ fontSize: 12, color: MUTED }}>kg</span>
                              </div>
                              <div style={{ fontSize: 10, color: trend >= 0 ? "#35F1A8" : "#F13535", marginTop: 2 }}>
                                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}kg
                              </div>
                            </div>
                            <Sparkline data={e1rms} color={day.color} width={72} height={36} />
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[
                              ["BEST 1RM", best.toFixed(1) + "kg", day.color],
                              ["TOP WT", Math.max(...maxWeights) + "kg", WHITE],
                              ["SESSIONS", sessions.length, WHITE],
                            ].map(([lbl, val, col]) => (
                              <div key={lbl} style={{ flex: 1 }}>
                                <div style={{ fontSize: 9, color: MUTED }}>{lbl}</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: col }}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {DAYS.every(d => d.exercises.every(ex => getSessions(ex.id).length === 0)) && (
              <div style={{ textAlign: "center", padding: "50px 20px", color: MUTED }}>
                <div style={{ fontSize: 44 }}>📈</div>
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  Progress charts appear here after your first logged workout.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Log Modal ── */}
      {logModal && (
        <div className="modal-wrap" onClick={e => { if (e.target.classList.contains("modal-wrap")) setLogModal(null); }}>
          <div className="modal">
            <div style={{ padding: "20px 22px 16px", borderBottom: "1px solid " + BORDER, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 1, color: logModal.color }}>
                  {logModal.exerciseName}
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 3 }}>{sessionDate} · log each set</div>
              </div>
              <button onClick={() => setLogModal(null)} style={{ background: "transparent", border: "none", color: MUTED, fontSize: 20, cursor: "pointer", padding: "0 4px", lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: "16px 22px" }}>
              {/* Column headers */}
              <div style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 34px", gap: 8, marginBottom: 8 }}>
                {["SET", "KG", "REPS", ""].map((h, i) => (
                  <div key={i} style={{ fontSize: 9, color: MUTED, letterSpacing: 1.5, textAlign: "center" }}>{h}</div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {tempSets.map((set, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "28px 1fr 1fr 34px", gap: 8, alignItems: "center", opacity: set.done ? 0.55 : 1 }}>
                    <div style={{ textAlign: "center", fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: set.done ? logModal.color : MUTED }}>
                      {i + 1}
                    </div>
                    <input type="number" inputMode="decimal" className="set-input"
                      placeholder="80" value={set.w}
                      onChange={e => setTempSets(ts => ts.map((s, j) => j === i ? { ...s, w: e.target.value } : s))}
                      style={{ borderColor: set.done && set.w ? logModal.color + "55" : undefined }} />
                    <input type="number" inputMode="numeric" className="set-input"
                      placeholder="8" value={set.r}
                      onChange={e => setTempSets(ts => ts.map((s, j) => j === i ? { ...s, r: e.target.value } : s))}
                      style={{ borderColor: set.done && set.r ? logModal.color + "55" : undefined }} />
                    <button onClick={() => setTempSets(ts => ts.map((s, j) => j === i ? { ...s, done: !s.done } : s))}
                      style={{
                        background: set.done ? logModal.color + "25" : "#1a1a1a",
                        border: "1px solid " + (set.done ? logModal.color : "#2a2a2a"),
                        borderRadius: 7, width: 34, height: 42, cursor: "pointer",
                        fontSize: 13, color: set.done ? logModal.color : "#555",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                      {set.done ? "✓" : "○"}
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => setTempSets(ts => [...ts, { w: ts[ts.length - 1]?.w || "", r: "", done: false }])}
                style={{
                  marginTop: 10, background: "transparent", border: "1px dashed #2a2a2a",
                  borderRadius: 9, padding: "9px", width: "100%", color: MUTED,
                  cursor: "pointer", fontSize: 12, fontFamily: "inherit",
                }}>
                + Add Set
              </button>

              {/* Previous session reference */}
              {(() => {
                const prev = getSessions(logModal.exerciseId).filter(s => s.date !== sessionDate).pop();
                if (!prev) return null;
                return (
                  <div style={{ marginTop: 12, padding: "11px 13px", background: "#0d0d0d", borderRadius: 10, border: "1px solid #1a1a1a" }}>
                    <div style={{ fontSize: 9, color: MUTED, letterSpacing: 1.5, marginBottom: 6 }}>
                      PREVIOUS — {prev.date}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {prev.sets.map((s, i) => (
                        <div key={i} style={{ background: "#1a1a1a", borderRadius: 6, padding: "3px 9px", fontSize: 11, color: "#888" }}>
                          {s.w}kg×{s.r}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div style={{ padding: "12px 22px 20px", display: "flex", gap: 8 }}>
              <button onClick={() => setLogModal(null)} style={{
                flex: 1, background: "transparent", border: "1px solid " + BORDER,
                borderRadius: 10, padding: "12px", color: MUTED,
                cursor: "pointer", fontSize: 13, fontFamily: "inherit",
              }}>Cancel</button>
              <button onClick={saveLog} style={{
                flex: 2, background: logModal.color, border: "none",
                borderRadius: 10, padding: "13px", color: DARK,
                cursor: "pointer", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              }}>Save Session</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "calc(28px + env(safe-area-inset-bottom))",
          left: "50%", transform: "translateX(-50%)",
          background: toast.type === "pr" ? A : "#1e1e1e",
          color: toast.type === "pr" ? DARK : WHITE,
          padding: "12px 22px", borderRadius: 10, fontSize: 13,
          fontWeight: 600, zIndex: 200,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          animation: "toastIn 0.2s ease", whiteSpace: "nowrap",
          fontFamily: "'DM Sans', sans-serif",
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
