import { s as supabase } from "./client-7ltkZr_J.js";
function genUserId6(taken = [], seed) {
  const used = new Set(taken);
  if (seed !== void 0 && seed !== null && String(seed).length > 0) {
    let h = 2166136261 >>> 0;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    for (let probe = 0; probe < 1e3; probe++) {
      const id = String(1e5 + (h + probe * 2654435761 >>> 0) % 9e5);
      if (!used.has(id)) return id;
    }
  }
  for (let i = 0; i < 1e3; i++) {
    const id = String(Math.floor(1e5 + Math.random() * 9e5));
    if (!used.has(id)) return id;
  }
  return String(Math.floor(1e5 + Math.random() * 9e5));
}
const USERS_KEY = "fk_users";
const SESSION_KEY = "fk_session";
const TX_KEY = "fk_tx";
const HISTORY_KEY = "fk_history";
const LANG_KEY = "fk_lang";
const FORCE_KEY = "fk_force";
const PAY_KEY = "fk_pay";
const COUPON_KEY = "fk_coupons";
const PROFIT_KEY = "fk_profit";
const PATTERN_KEY = "fk_pattern";
const SOUND_KEY = "fk_sound_on";
const SPEED_KEY = "fk_call_speed_ms";
const STOP_KEY = "fk_stop_signal";
const ACTIVITY_KEY = "fk_activity";
const HISTORY_RETENTION_MS = 30 * 24 * 60 * 60 * 1e3;
const SIGNUP_BONUS = 20;
const REFERRAL_SIGNUP_BONUS = 15;
const REFERRAL_DEPOSIT_BONUS = 50;
const REFERRAL_DEPOSIT_THRESHOLD = 100;
const WAGER_REQUIREMENT = 75;
function read(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}
const ADMIN_PHONE = "0941815119";
const ADMIN_PASSWORD = "14141312";
function getUsers() {
  const users = read(USERS_KEY, []);
  const adminIdx = users.findIndex((u) => u.isAdmin);
  if (adminIdx === -1) {
    users.push({ username: "admin", password: ADMIN_PASSWORD, phone: ADMIN_PHONE, balance: 0, isAdmin: true });
    write(USERS_KEY, users);
  } else {
    const cur = users[adminIdx];
    if (cur.phone !== ADMIN_PHONE || cur.password !== ADMIN_PASSWORD) {
      users[adminIdx] = { ...cur, phone: ADMIN_PHONE, password: ADMIN_PASSWORD };
      write(USERS_KEY, users);
    }
  }
  return users;
}
function saveUsers(users) {
  write(USERS_KEY, users);
}
function getSession() {
  return read(SESSION_KEY, null);
}
function setSession(username) {
  write(SESSION_KEY, username);
}
function getCurrentUser() {
  const s = getSession();
  if (!s) return null;
  return getUsers().find((u) => u.username === s) ?? null;
}
function updateUser(updated) {
  const users = getUsers().map((u) => u.username === updated.username ? updated : u);
  saveUsers(users);
}
function getTx() {
  return read(TX_KEY, []);
}
function saveTx(tx) {
  write(TX_KEY, tx);
}
function addTx(tx) {
  const all = getTx();
  all.unshift(tx);
  saveTx(all);
}
function getHistory() {
  return read(HISTORY_KEY, []);
}
function addHistory(r) {
  const cutoff = Date.now() - HISTORY_RETENTION_MS;
  const all = getHistory().filter((x) => (x.at ?? 0) >= cutoff);
  all.unshift(r);
  write(HISTORY_KEY, all);
}
function getLang() {
  return read(LANG_KEY, "am") || "am";
}
function setLang(l) {
  write(LANG_KEY, l);
}
function getForcedDraw() {
  return read(FORCE_KEY, []);
}
function setForcedDraw(nums) {
  write(FORCE_KEY, nums);
}
function clearForcedDraw() {
  if (typeof window !== "undefined") localStorage.removeItem(FORCE_KEY);
}
function getPayInfo() {
  return read(PAY_KEY, { telebirr: "0911000000", cbe: "1000123456789" });
}
function setPayInfo(p) {
  write(PAY_KEY, p);
}
function getCoupons() {
  return read(COUPON_KEY, []);
}
function saveCoupons(c) {
  write(COUPON_KEY, c);
}
function addCoupon(c) {
  const all = getCoupons();
  all.unshift(c);
  saveCoupons(all);
}
function redeemCoupon(code, username) {
  const all = getCoupons();
  const c = all.find((x) => x.code.toUpperCase() === code.trim().toUpperCase());
  if (!c) return { ok: false, msg: "Invalid code" };
  if (Date.now() > c.expiresAt) return { ok: false, msg: "Expired" };
  if (c.usedBy.includes(username)) return { ok: false, msg: "Already used" };
  if (c.usedBy.length >= c.maxUses) return { ok: false, msg: "Limit reached" };
  c.usedBy.push(username);
  saveCoupons(all);
  const users = getUsers();
  const u = users.find((x) => x.username === username);
  if (u) {
    u.balance += c.amount;
    saveUsers(users);
  }
  return { ok: true, amount: c.amount, msg: `+${c.amount} ETB` };
}
function getProfit() {
  return read(PROFIT_KEY, 0);
}
function addProfit(delta) {
  write(PROFIT_KEY, getProfit() + delta);
}
function getActivePattern() {
  return read(PATTERN_KEY, "single_line") || "single_line";
}
function setActivePattern(id) {
  write(PATTERN_KEY, id);
}
const PATTERN_IDS_KEY = "fk_pattern_ids";
const PATTERN_ROTATE_KEY = "fk_pattern_rotate";
function getActivePatternIds() {
  const arr = read(PATTERN_IDS_KEY, []);
  return Array.isArray(arr) ? arr : [];
}
function setActivePatternIds(ids) {
  write(PATTERN_IDS_KEY, Array.from(new Set(ids)));
}
function getPatternRotate() {
  return read(PATTERN_ROTATE_KEY, false);
}
function setPatternRotate(v) {
  write(PATTERN_ROTATE_KEY, v);
}
const FORCE_WIN_KEY = "fk_force_winner";
function getForceWinner() {
  return read(FORCE_WIN_KEY, "") || "";
}
function setForceWinner(v) {
  write(FORCE_WIN_KEY, v);
}
function clearForceWinner() {
  if (typeof window !== "undefined") localStorage.removeItem(FORCE_WIN_KEY);
}
function getSoundOn() {
  return read(SOUND_KEY, true);
}
function setSoundOn(v) {
  write(SOUND_KEY, v);
}
const SPEED_MIN = 200;
const SPEED_MAX = 4e3;
const SPEED_DEFAULT = 1e3;
function getCallSpeed() {
  const v = read(SPEED_KEY, SPEED_DEFAULT);
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, v || SPEED_DEFAULT));
}
function setCallSpeed(ms) {
  const v = Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(ms)));
  write(SPEED_KEY, v);
  _broadcast({ type: "speed", ms: v });
}
let _broadcaster = null;
function setBroadcaster(fn) {
  _broadcaster = fn;
}
function _broadcast(ev) {
  try {
    _broadcaster?.(ev);
  } catch {
  }
}
function raiseStopSignal() {
  write(STOP_KEY, Date.now());
  _broadcast({ type: "stop" });
}
const PAUSE_KEY = "fk_pause_signal";
const RESUME_KEY = "fk_resume_signal";
const RESTART_KEY = "fk_restart_signal";
function raisePauseSignal() {
  write(PAUSE_KEY, Date.now());
  _broadcast({ type: "pause" });
}
function raiseResumeSignal() {
  write(RESUME_KEY, Date.now());
  _broadcast({ type: "resume" });
}
function raiseRestartSignal() {
  write(RESTART_KEY, Date.now());
  _broadcast({ type: "restart" });
}
const ACTIVITY_RETENTION_MS = 30 * 24 * 60 * 60 * 1e3;
function getActivities() {
  return read(ACTIVITY_KEY, []);
}
function logActivity(a) {
  const cutoff = Date.now() - ACTIVITY_RETENTION_MS;
  const all = getActivities().filter((x) => x.at >= cutoff);
  all.unshift({ id: String(Date.now()) + Math.random().toString(36).slice(2, 6), at: Date.now(), ...a });
  write(ACTIVITY_KEY, all.slice(0, 2e3));
}
let channel = null;
let isRemote = false;
let myPresence = null;
const presenceMap = /* @__PURE__ */ new Map();
let listeners = [];
function emit() {
  const list = Array.from(presenceMap.values());
  listeners.forEach((fn) => fn(list));
}
function subscribePresence(fn) {
  listeners.push(fn);
  fn(Array.from(presenceMap.values()));
  return () => {
    listeners = listeners.filter((f) => f !== fn);
  };
}
function getRemotePlayers() {
  return Array.from(presenceMap.values());
}
function trackPresence(p) {
  myPresence = p;
  if (channel) void channel.track({ ...p, at: Date.now() });
}
function untrackPresence() {
  myPresence = null;
  if (channel) void channel.untrack();
}
function broadcastControl(ev) {
  if (!channel || isRemote) return;
  void channel.send({ type: "broadcast", event: "control", payload: ev });
}
function initRealtime() {
  if (channel || typeof window === "undefined") return;
  setBroadcaster((ev) => {
    if (ev.type === "speed") broadcastControl({ type: "speed", ms: ev.ms });
    else broadcastControl({ type: ev.type });
  });
  channel = supabase.channel("fk_game", {
    config: { presence: { key: "" }, broadcast: { self: false } }
  });
  channel.on("broadcast", { event: "control" }, ({ payload }) => {
    const ev = payload;
    isRemote = true;
    try {
      switch (ev.type) {
        case "stop":
          raiseStopSignal();
          break;
        case "pause":
          raisePauseSignal();
          break;
        case "resume":
          raiseResumeSignal();
          break;
        case "restart":
          raiseRestartSignal();
          break;
        case "speed":
          if (ev.ms !== getCallSpeed()) setCallSpeed(ev.ms);
          break;
      }
    } finally {
      isRemote = false;
    }
  });
  channel.on("presence", { event: "sync" }, () => {
    const state = channel.presenceState();
    presenceMap.clear();
    for (const arr of Object.values(state)) {
      for (const raw of arr) {
        const p = raw;
        if (p && typeof p.username === "string") {
          presenceMap.set(p.username, {
            username: p.username,
            stake: p.stake ?? 0,
            joined: !!p.joined,
            gameNo: p.gameNo ?? 0,
            at: p.at ?? Date.now()
          });
        }
      }
    }
    emit();
  });
  channel.subscribe((status) => {
    if (status === "SUBSCRIBED" && myPresence) {
      void channel.track({ ...myPresence, at: Date.now() });
    }
  });
}
const realtime = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRemotePlayers,
  initRealtime,
  subscribePresence,
  trackPresence,
  untrackPresence
}, Symbol.toStringTag, { value: "Module" }));
export {
  getProfit as A,
  addCoupon as B,
  setPatternRotate as C,
  setActivePatternIds as D,
  setActivePattern as E,
  raisePauseSignal as F,
  raiseResumeSignal as G,
  raiseRestartSignal as H,
  raiseStopSignal as I,
  SPEED_MAX as J,
  SPEED_MIN as K,
  setCallSpeed as L,
  setForceWinner as M,
  clearForceWinner as N,
  REFERRAL_DEPOSIT_BONUS as O,
  setLang as P,
  redeemCoupon as Q,
  REFERRAL_SIGNUP_BONUS as R,
  SPEED_DEFAULT as S,
  getCoupons as T,
  setPayInfo as U,
  setForcedDraw as V,
  WAGER_REQUIREMENT as W,
  clearForcedDraw as X,
  REFERRAL_DEPOSIT_THRESHOLD as Y,
  saveTx as Z,
  realtime as _,
  getCallSpeed as a,
  getSoundOn as b,
  getUsers as c,
  setSession as d,
  genUserId6 as e,
  SIGNUP_BONUS as f,
  getRemotePlayers as g,
  saveUsers as h,
  addTx as i,
  getCurrentUser as j,
  getLang as k,
  setSoundOn as l,
  addProfit as m,
  addHistory as n,
  logActivity as o,
  getPayInfo as p,
  getHistory as q,
  getTx as r,
  subscribePresence as s,
  getForcedDraw as t,
  updateUser as u,
  getActivePattern as v,
  getActivePatternIds as w,
  getPatternRotate as x,
  getForceWinner as y,
  getActivities as z
};
