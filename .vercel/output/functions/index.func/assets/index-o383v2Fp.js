import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Toaster as Toaster$1, toast } from "sonner";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { g as getRemotePlayers, s as subscribePresence, a as getCallSpeed, S as SPEED_DEFAULT, b as getSoundOn, c as getUsers, d as setSession, R as REFERRAL_SIGNUP_BONUS, e as genUserId6, f as SIGNUP_BONUS, h as saveUsers, i as addTx, j as getCurrentUser, k as getLang, l as setSoundOn, u as updateUser, m as addProfit, n as addHistory, o as logActivity, p as getPayInfo, q as getHistory, r as getTx, W as WAGER_REQUIREMENT, t as getForcedDraw, v as getActivePattern, w as getActivePatternIds, x as getPatternRotate, y as getForceWinner, z as getActivities, A as getProfit, B as addCoupon, C as setPatternRotate, D as setActivePatternIds, E as setActivePattern, F as raisePauseSignal, G as raiseResumeSignal, H as raiseRestartSignal, I as raiseStopSignal, J as SPEED_MAX, K as SPEED_MIN, L as setCallSpeed, M as setForceWinner, N as clearForceWinner, O as REFERRAL_DEPOSIT_BONUS, P as setLang, Q as redeemCoupon, T as getCoupons, U as setPayInfo, V as setForcedDraw, X as clearForcedDraw, Y as REFERRAL_DEPOSIT_THRESHOLD, Z as saveTx } from "./realtime-yvHaME7H.js";
import { s as supabase } from "./client-7ltkZr_J.js";
import { B as BOT_USERNAME, p as patternById, c as checkWin, a as previewMask, P as PATTERNS } from "./router-BrsPmWgQ.js";
import { Share2, User, Phone, EyeOff, Eye, Play, Trophy, BarChart3, Crown, History, Wallet, Menu, Check, Volume2, VolumeX, ShieldCheck, Languages, LogOut, Download, Gift, Plus, Minus, MessageCircle, Move, Printer, X, Copy, Receipt, Gauge, Square } from "lucide-react";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "@tanstack/react-router";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = ProgressPrimitive.Root.displayName;
function useLivePlayers() {
  const [list, setList] = useState(
    () => typeof window === "undefined" ? [] : getRemotePlayers()
  );
  useEffect(() => subscribePresence(setList), []);
  return list;
}
const EPOCH_MS = 17e11;
const COUNTDOWN_S = 25;
const DRAWING_S = 120;
const CYCLE_S = COUNTDOWN_S + DRAWING_S;
const TOTAL_BALLS = 75;
function deriveClock(nowMs = Date.now(), speedMs = SPEED_DEFAULT) {
  const sinceEpochMs = Math.max(0, nowMs - EPOCH_MS);
  const cycleMs = CYCLE_S * 1e3;
  const gameNo = Math.floor(sinceEpochMs / cycleMs);
  const intoCycleMs = sinceEpochMs % cycleMs;
  const countdownMs = COUNTDOWN_S * 1e3;
  if (intoCycleMs < countdownMs) {
    return {
      gameNo,
      drawing: false,
      countdown: Math.max(0, Math.ceil((countdownMs - intoCycleMs) / 1e3)),
      drawnCount: 0,
      elapsedMs: intoCycleMs,
      raw: null
    };
  }
  const drawElapsedMs = intoCycleMs - countdownMs;
  const drawnCount = Math.min(
    TOTAL_BALLS,
    Math.max(0, Math.floor(drawElapsedMs / Math.max(200, speedMs)))
  );
  return {
    gameNo,
    drawing: true,
    countdown: 0,
    drawnCount,
    elapsedMs: drawElapsedMs,
    raw: null
  };
}
function useServerClock(_syncMs = 250) {
  const [speed, setSpeed] = useState(() => getCallSpeed());
  const [clock, setClock] = useState(() => deriveClock(Date.now(), getCallSpeed()));
  useEffect(() => {
    const tick = window.setInterval(() => {
      const s = getCallSpeed();
      setSpeed((prev) => prev === s ? prev : s);
      setClock(deriveClock(Date.now(), s));
    }, 150);
    const onStorage = (e) => {
      if (e.key === "fk_call_speed_ms") setSpeed(getCallSpeed());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearInterval(tick);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return clock;
}
function useTakenCartellas(gameNo) {
  const [map, setMap] = useState(/* @__PURE__ */ new Map());
  useEffect(() => {
    let cancelled = false;
    setMap(/* @__PURE__ */ new Map());
    const load = async () => {
      const { data } = await supabase.from("game_cartellas").select("cartella_id, username, stake").eq("game_no", gameNo);
      if (cancelled || !data) return;
      const next = /* @__PURE__ */ new Map();
      for (const row of data) {
        next.set(row.cartella_id, {
          username: row.username,
          stake: row.stake
        });
      }
      setMap(next);
    };
    void load();
    const channel = supabase.channel(`game_cartellas_${gameNo}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "game_cartellas", filter: `game_no=eq.${gameNo}` },
      (payload) => {
        setMap((prev) => {
          const next = new Map(prev);
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const r = payload.new;
            next.set(r.cartella_id, { username: r.username, stake: r.stake });
          } else if (payload.eventType === "DELETE") {
            const r = payload.old;
            if (r?.cartella_id != null) next.delete(r.cartella_id);
          }
          return next;
        });
      }
    ).subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [gameNo]);
  return map;
}
function useGameWinner(gameNo) {
  const [winner, setWinner] = useState(null);
  useEffect(() => {
    let cancelled = false;
    setWinner(null);
    const load = async () => {
      const { data } = await supabase.from("game_winners").select("*").eq("game_no", gameNo).maybeSingle();
      if (!cancelled && data) setWinner(data);
    };
    void load();
    const channel = supabase.channel(`game_winners_${gameNo}`).on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "game_winners", filter: `game_no=eq.${gameNo}` },
      (payload) => setWinner(payload.new)
    ).subscribe();
    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [gameNo]);
  return winner;
}
async function claimCartella(gameNo, cartellaId, username, stake) {
  const { error } = await supabase.from("game_cartellas").insert({ game_no: gameNo, cartella_id: cartellaId, username, stake });
  return !error;
}
async function releaseCartella(gameNo, cartellaId, username) {
  await supabase.from("game_cartellas").delete().eq("game_no", gameNo).eq("cartella_id", cartellaId).eq("username", username);
}
async function claimWinner(args) {
  const { error } = await supabase.from("game_winners").insert({
    game_no: args.gameNo,
    username: args.username,
    cartella_id: args.cartellaId,
    pattern_id: args.patternId,
    payout: args.payout,
    drawn_count: args.drawnCount
  });
  return !error;
}
async function notifyTelegram(_input) {
  return;
}
function fmtEtb(n) {
  return `${n.toFixed(2)} ETB`;
}
const dict = {
  am: {
    appName: "ሁሉ ቢንጎ",
    login: "ግባ",
    register: "ተመዝገብ",
    logout: "ውጣ",
    username: "የተጠቃሚ ስም",
    password: "የይለፍ ቃል",
    balance: "ቀሪ ሂሳብ",
    deposit: "ገንዘብ አስገባ",
    withdraw: "ገንዘብ አውጣ",
    amount: "መጠን",
    submit: "ላክ",
    play: "ጨዋታ",
    history: "ታሪክ",
    winners: "ውጤቶች",
    stats: "ስታቲስቲክስ",
    admin: "አስተዳዳሪ",
    pending: "በመጠባበቅ ላይ",
    approve: "አጽድቅ",
    reject: "ውድቅ አድርግ",
    pick10: "10 ቁጥሮችን ይምረጡ",
    from80: "ከ 1 እስከ 80",
    clear: "ማጥፋት",
    double: "X2",
    placeBet: "ይጫወቱ",
    drawing: "በመውጣት ላይ...",
    won: "አሸንፈዋል",
    lost: "ይቅርታ",
    bet: "ውርርድ",
    noPicks: "እባክዎ ቁጥሮችን ይምረጡ",
    insufficient: "ቀሪ ሂሳብዎ በቂ አይደለም",
    welcome: "እንኳን ደህና መጡ",
    requestSent: "ጥያቄዎ ተልኳል",
    approved: "ጸድቋል",
    rejected: "ውድቅ ሆኗል",
    nothingPending: "ምንም ጥያቄ የለም",
    settings: "ቅንብሮች",
    max: "ማክስ",
    bets: "ጨዋታ",
    redo: "ታሪክ",
    winnersTab: "ውጤቶች",
    statsTab: "ስታቲስቲክስ",
    total: "ሁሉም",
    myTickets: "የእኔ ቲኬቶች",
    myWins: "የእኔ ጨዋታዎች",
    waiting: "በመጠባበቅ ላይ",
    errInsufficient: "በቂ ቀሪ ሂሳብ የለም",
    errPick: "እባክዎ ቁጥሮችን ይምረጡ",
    matches: "ተዛማጅ",
    payout: "ክፍያ",
    chat: "ውይይት",
    send: "ላክ",
    typeMsg: "መልዕክት ጻፍ...",
    online: "ኦንላይን",
    forceDraw: "የሚቀጥለውን ጨዋታ ቁጥሮች",
    forceHint: "በነጠላ ሰረዝ የተለዩ 1-80",
    forceSet: "አስቀምጥ",
    forceClear: "አጥፋ",
    nextWinners: "የሚቀጥሉ አሸናፊዎች",
    noWinners: "አሸናፊ የለም",
    profit: "ትርፍ",
    home: "ቤት",
    game: "ጨዋታ",
    results: "ውጤቶች",
    statistics: "ስታቲስቲክስ",
    leaders: "መሪዎች",
    me: "እኔ",
    menu: "ምናሌ",
    phone: "ስልክ ቁጥር",
    drawId: "የጨዋታ መለያ",
    combination: "ቁጥሮች",
    last100: "የመጨረሻ 100 ጨዋታዎች",
    sort: "ደርደር",
    rank: "ደረጃ",
    id: "መለያ",
    games: "ጨዋታ",
    win: "ሽልማት",
    profile: "መገለጫ",
    install: "መተግበሪያውን ጫን",
    installed: "ተጭኗል",
    referral: "የጋባዥ መለያ",
    invite: "ጓደኛ ጋብዝ",
    inviteMsg: "ሁሉ ቢንጎ ይጫወቱ! ይህን መለያ ይጠቀሙ:",
    payTelebirr: "በቴሌብር",
    payCBE: "በ CBE",
    sendTo: "ወደዚህ ቁጥር ይላኩ",
    afterPayHint: "ከከፈሉ በኋላ ላክ ይጫኑ",
    withdrawPhone: "የተመዘገበ ስልክ",
    players: "ተጫዋቾች",
    paySettings: "የክፍያ ቁጥሮች",
    save: "አስቀምጥ",
    bonus20: "20 ETB የመመዝገብ ስጦታ",
    transactions: "ግብይቶች",
    coupons: "ኮፖን",
    redeem: "ኮድ ቤዛ",
    enterCode: "ኮድ አስገባ",
    grandWinner: "ታላቅ አሸናፊ",
    winningTicket: "የአሸናፊ ቲኬት",
    ticket: "ቲኬት",
    livePlayers: "ቀጥታ ተጫዋቾች",
    totalProfit: "አጠቃላይ ትርፍ",
    code: "ኮድ",
    expires: "የሚያበቃበት",
    maxUses: "ቁጥር",
    used: "ጥቅም ላይ",
    create: "ፍጠር",
    status: "ሁኔታ",
    date: "ቀን",
    type: "አይነት"
  },
  en: {
    appName: "Hulu Bingo",
    login: "Login",
    register: "Register",
    logout: "Logout",
    username: "Username",
    password: "Password",
    balance: "Balance",
    deposit: "Deposit",
    withdraw: "Withdraw",
    amount: "Amount",
    submit: "Submit",
    play: "Play",
    history: "History",
    winners: "Winners",
    stats: "Stats",
    admin: "Admin",
    pending: "Pending",
    approve: "Approve",
    reject: "Reject",
    pick10: "Pick 10 numbers",
    from80: "From 1 to 80",
    clear: "Clear",
    double: "X2",
    placeBet: "Play",
    drawing: "Drawing...",
    won: "You Won!",
    lost: "Better luck next time",
    bet: "Bet",
    noPicks: "Please pick numbers first",
    insufficient: "Insufficient balance",
    welcome: "Welcome",
    requestSent: "Request sent",
    approved: "Approved",
    rejected: "Rejected",
    nothingPending: "No pending requests",
    settings: "Settings",
    max: "Max",
    bets: "Play",
    redo: "History",
    winnersTab: "Winners",
    statsTab: "Stats",
    total: "Total",
    myTickets: "My Tickets",
    myWins: "My Plays",
    waiting: "Waiting",
    errInsufficient: "Insufficient balance",
    errPick: "Please pick numbers first",
    matches: "Matches",
    payout: "Payout",
    chat: "Chat",
    send: "Send",
    typeMsg: "Type a message...",
    online: "online",
    forceDraw: "Force next round numbers",
    forceHint: "Comma separated 1-80",
    forceSet: "Set",
    forceClear: "Clear",
    nextWinners: "Next winners preview",
    noWinners: "No winners",
    profit: "Profit",
    home: "Home",
    game: "Game",
    results: "Results",
    statistics: "Statistics",
    leaders: "Leaders",
    me: "Me",
    menu: "Menu",
    phone: "Phone",
    drawId: "Draw ID",
    combination: "Combination",
    last100: "Last 100 rounds",
    sort: "Sort",
    rank: "#",
    id: "ID",
    games: "Games",
    win: "Win",
    profile: "Profile",
    install: "Install App",
    installed: "Installed",
    referral: "Inviter ID",
    invite: "Invite a friend",
    inviteMsg: "Play Hulu Bingo! Use this inviter ID:",
    payTelebirr: "Telebirr",
    payCBE: "CBE",
    sendTo: "Send to this number",
    afterPayHint: "After paying tap Submit",
    withdrawPhone: "Registered phone",
    players: "Players",
    paySettings: "Payment numbers",
    save: "Save",
    bonus20: "20 ETB signup bonus",
    transactions: "Transactions",
    coupons: "Coupons",
    redeem: "Redeem Code",
    enterCode: "Enter code",
    grandWinner: "GRAND WINNER",
    winningTicket: "WINNING TICKET",
    ticket: "TICKET",
    livePlayers: "Live Players",
    totalProfit: "Total Profit",
    code: "Code",
    expires: "Expires",
    maxUses: "Max uses",
    used: "Used",
    create: "Create",
    status: "Status",
    date: "Date",
    type: "Type"
  }
};
const logo = "/assets/fastbingo-logo-CsCjdskF.png";
const telebirrLogo = "/assets/telebirr-logo-BRQVlV--.png";
const cbeLogo = "/assets/cbe-logo-BU3QGFtp.png";
const telegramLogo = "/assets/telegram-logo-DLNyNGvf.png";
function downloadCartellaPdf(opts) {
  const { cartella, cartellaId, username, bet, patternLabel } = opts;
  const cellHtml = cartella.map((n, i) => {
    const free = i === 12;
    return `<div class="c${free ? " free" : ""}">${free ? "★" : n || ""}</div>`;
  }).join("");
  const title = `Cartella #${cartellaId ?? "-"} — ${username}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  *{box-sizing:border-box;font-family:system-ui,Segoe UI,Roboto,sans-serif}
  body{margin:0;padding:24px;background:#fff;color:#0f172a}
  .wrap{max-width:380px;margin:0 auto;border:3px solid #f59e0b;border-radius:14px;padding:14px;background:#f8fafc}
  h1{font-size:18px;margin:0 0 4px;letter-spacing:.06em;color:#b45309;text-align:center}
  .sub{font-size:11px;color:#475569;text-align:center;margin-bottom:10px}
  .head{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:6px}
  .head>div{font-weight:900;color:#fff;text-align:center;padding:6px 0;border-radius:6px;font-size:18px}
  .head>div:nth-child(1){background:#1e63d6}
  .head>div:nth-child(2){background:#e02424}
  .head>div:nth-child(3){background:#374151}
  .head>div:nth-child(4){background:#16803c}
  .head>div:nth-child(5){background:#ef7c1f}
  .grid{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}
  .c{aspect-ratio:1;display:flex;align-items:center;justify-content:center;background:#fff;border:1px solid #cbd5e1;border-radius:8px;font-weight:800;font-size:22px}
  .c.free{background:radial-gradient(circle at 30% 30%, #fde047, #d97706);color:#fff}
  .meta{margin-top:10px;display:flex;justify-content:space-between;font-size:11px;color:#475569}
  @media print{ body{padding:0} .wrap{box-shadow:none} }
</style></head><body>
<div class="wrap">
  <h1>BINGO CARTELLA #${cartellaId ?? "-"}</h1>
  <div class="sub">Player: <b>${escapeHtml(username)}</b>${typeof bet === "number" ? ` · Bet ${bet} ETB` : ""}${patternLabel ? ` · ${escapeHtml(patternLabel)}` : ""}</div>
  <div class="head"><div>B</div><div>I</div><div>N</div><div>G</div><div>O</div></div>
  <div class="grid">${cellHtml}</div>
  <div class="meta"><span>Issued ${(/* @__PURE__ */ new Date()).toLocaleString()}</span><span>Adey Bingo</span></div>
</div>
<script>window.onload=()=>{setTimeout(()=>{window.print();},250);};<\/script>
</body></html>`;
  const w = window.open("", "_blank", "width=420,height=620");
  if (!w) return;
  w.document.open();
  w.document.write(html);
  w.document.close();
}
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
const url$7 = "/__l5e/assets-v1/aa603c4f-3139-4a52-bdd0-b9c5d238f2e5/profile-avatar.png";
const avatarIcon = {
  url: url$7
};
const url$6 = "/__l5e/assets-v1/cd84f27c-ec37-4daf-8e73-361acc9f47ad/profile-wallet.png";
const walletIcon = {
  url: url$6
};
const url$5 = "/__l5e/assets-v1/851a17d7-2f2d-4235-9ade-0e1b00d7db5d/profile-deposit.png";
const depositIcon = {
  url: url$5
};
const url$4 = "/__l5e/assets-v1/5346bd5b-c077-4ded-8822-e873e5eccbfa/profile-withdraw.png";
const withdrawIcon = {
  url: url$4
};
const url$3 = "/__l5e/assets-v1/c9f2c68c-057f-4b4b-bc70-065871307b3b/profile-transactions.png";
const transactionsIcon = {
  url: url$3
};
const url$2 = "/__l5e/assets-v1/50ff06f7-0f8f-45e6-84de-99b37ef09b2a/profile-download.png";
const downloadIcon = {
  url: url$2
};
const url$1 = "/__l5e/assets-v1/82875e45-46ed-4687-9a2a-6534e9d8dfa5/profile-logout.png";
const logoutIcon = {
  url: url$1
};
const url = "/__l5e/assets-v1/45e44446-25b7-473d-b82c-8f8a32cb8054/profile-coupon.png";
const couponIcon = {
  url
};
function JoinTicker() {
  const players = useLivePlayers();
  const knownIds = useRef(null);
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);
  useEffect(() => {
    const joinedNames = new Set(players.filter((p) => p.joined).map((p) => p.username));
    if (knownIds.current === null) {
      knownIds.current = joinedNames;
      return;
    }
    const fresh = [];
    for (const name of joinedNames) {
      if (!knownIds.current.has(name)) {
        seq.current += 1;
        fresh.push({ key: seq.current, name });
      }
    }
    knownIds.current = joinedNames;
    if (fresh.length === 0) return;
    setToasts((cur) => [...cur, ...fresh]);
    fresh.forEach((f) => {
      window.setTimeout(() => {
        setToasts((cur) => cur.filter((t) => t.key !== f.key));
      }, 3400);
    });
  }, [players]);
  if (toasts.length === 0) return null;
  return /* @__PURE__ */ jsx("div", { className: "pointer-events-none relative h-7 overflow-hidden bg-background/40 border-b border-border/40", children: toasts.map((t, i) => /* @__PURE__ */ jsx(
    "div",
    {
      className: "join-ticker-item absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] font-semibold text-[#f5c518]",
      style: { animationDelay: `${i * 150}ms` },
      children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f5c518]/15 border border-[#f5c518]/40", children: [
        "🎉 ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground", children: t.name }),
        " joined"
      ] })
    },
    t.key
  )) });
}
const ADS = [
  {
    title: "Invite & Earn 50 ETB",
    subtitle: "Bonus on every friend who signs up",
    cta: "Share on Telegram",
    gradient: "linear-gradient(135deg,#0088cc 0%,#005f8a 100%)",
    emoji: "🎁"
  },
  {
    title: "Double Bonus Today",
    subtitle: "+100 ETB when your friend deposits",
    cta: "Invite Now",
    gradient: "linear-gradient(135deg,#f59e0b 0%,#b45309 100%)",
    emoji: "💸"
  },
  {
    title: "Play Together, Win Bigger",
    subtitle: "Bring friends, share the pot",
    cta: "Send Invite",
    gradient: "linear-gradient(135deg,#16a34a 0%,#065f46 100%)",
    emoji: "🏆"
  },
  {
    title: "Limited Referral Boost",
    subtitle: "Top inviters featured on leaderboard",
    cta: "Share Link",
    gradient: "linear-gradient(135deg,#7c3aed 0%,#4c1d95 100%)",
    emoji: "🚀"
  },
  {
    title: "Earn While They Play",
    subtitle: "Lifetime referral rewards",
    cta: "Invite Friends",
    gradient: "linear-gradient(135deg,#dc2626 0%,#7f1d1d 100%)",
    emoji: "🔥"
  }
];
function InviteAdsRotator({ refCode }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % ADS.length), 5e3);
    return () => clearInterval(id);
  }, []);
  const share = () => {
    const url2 = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(refCode)}`;
    const msg = `🎮 Join me on Bingo! Play, win & earn. Use my link: ${url2}`;
    const tg = `https://t.me/share/url?url=${encodeURIComponent(url2)}&text=${encodeURIComponent(msg)}`;
    window.open(tg, "_blank");
  };
  const ad = ADS[i];
  return /* @__PURE__ */ jsx("div", { className: "px-2 pt-1 overflow-hidden", style: { contain: "layout paint" }, children: /* @__PURE__ */ jsx("div", { className: "relative h-[52px]", children: /* @__PURE__ */ jsx(
    "button",
    {
      onClick: share,
      className: "absolute inset-0 w-full text-left rounded-lg overflow-hidden shadow-md ad-fly",
      style: { background: ad.gradient },
      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-3 py-2 h-full", children: [
        /* @__PURE__ */ jsx("div", { className: "text-3xl drop-shadow", children: ad.emoji }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-white font-extrabold text-sm leading-tight truncate", children: ad.title }),
          /* @__PURE__ */ jsx("div", { className: "text-white/85 text-[11px] truncate", children: ad.subtitle })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/95 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap shrink-0", children: [
          ad.cta,
          " ›"
        ] })
      ] })
    },
    i
  ) }) });
}
function maskPhone(p) {
  if (!p) return "—";
  const s = p.trim();
  if (s.length < 7) return s;
  return s.slice(0, 4) + "****" + s.slice(-2);
}
function ensureUserId6(user) {
  if (user.userId6) return user.userId6;
  const users = getUsers();
  const taken = new Set(users.map((u) => u.userId6).filter(Boolean));
  const seed = user.telegramId ?? user.phone ?? user.username;
  const id = genUserId6(taken, seed);
  const idx = users.findIndex((u) => u.username === user.username);
  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      userId6: id
    };
    saveUsers(users);
  }
  user.userId6 = id;
  return id;
}
const COLORS = ["#16a34a", "#171717", "#dc2626", "#facc15", "#2563eb"];
const ROW_STARTS = [0, 2, 4, 1, 4, 0, 2, 4, 1];
const ballColor = (n) => {
  const row = Math.floor((n - 1) / 10);
  const col = (n - 1) % 10;
  const start = ROW_STARTS[row] || 0;
  return COLORS[(start + col) % 5];
};
const ballStyle = (n) => ({
  ["--ball-color"]: ballColor(n)
});
function bingoLetter(n) {
  if (n <= 15) return "B";
  if (n <= 30) return "I";
  if (n <= 45) return "N";
  if (n <= 60) return "G";
  return "O";
}
const COL_RANGES = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75]
};
function seededRandom(seed) {
  let t = seed >>> 0;
  return () => {
    t += 1831565813;
    let r = Math.imul(t ^ t >>> 15, t | 1);
    r ^= r + Math.imul(r ^ r >>> 7, r | 61);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}
function drawOrderForGame(gameNo) {
  const rand = seededRandom((gameNo + 1) * 2654435761);
  const nums = Array.from({
    length: 75
  }, (_, i) => i + 1);
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  return nums;
}
function cartellaById(id) {
  const card = Array(25).fill(0);
  const rng = (i) => (Math.sin(id * 9301 + i * 49297) + 1) / 2;
  Object.keys(COL_RANGES).forEach((L, colIdx) => {
    const [lo, hi] = COL_RANGES[L];
    const pool = [];
    for (let n = lo; n <= hi; n++) pool.push(n);
    for (let k = pool.length - 1; k > 0; k--) {
      const j = Math.floor(rng(colIdx * 17 + k) * (k + 1));
      [pool[k], pool[j]] = [pool[j], pool[k]];
    }
    const picks = pool.slice(0, 5);
    for (let r = 0; r < 5; r++) card[r * 5 + colIdx] = picks[r];
  });
  card[12] = 0;
  return card;
}
const BINGO_COL_BG = {
  B: "#1e63d6",
  I: "#e02424",
  N: "#374151",
  G: "#16803c",
  O: "#ef7c1f"
};
function useT() {
  const [lang, setLangState] = useState("am");
  useEffect(() => setLangState(getLang()), []);
  const t = (k) => dict[lang][k];
  const change = (l) => {
    setLang(l);
    setLangState(l);
  };
  return {
    t,
    lang,
    setLang: change
  };
}
function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("game");
  const [walletScreen, setWalletScreen] = useState("main");
  const gotoWallet = (s = "main") => {
    setWalletScreen(s);
    setView("wallet");
  };
  const [tick, setTick] = useState(0);
  const {
    t,
    lang,
    setLang: setLang2
  } = useT();
  const serverClock = useServerClock();
  const status = {
    countdown: serverClock.countdown,
    drawing: serverClock.drawing,
    drawnCount: serverClock.drawnCount,
    gameNo: serverClock.gameNo
  };
  const setStatus = () => {
  };
  const [soundOn, setSoundOnState] = useState(true);
  const [splash, setSplash] = useState(true);
  useEffect(() => {
    setSoundOnState(getSoundOn());
  }, []);
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundOnState(next);
  };
  useEffect(() => {
    getUsers();
    let urlTg = null;
    let urlPhone;
    let urlView;
    let urlCode;
    try {
      const url2 = new URL(window.location.href);
      const tgId = Number(url2.searchParams.get("tg"));
      const name = url2.searchParams.get("name") || void 0;
      const uname = url2.searchParams.get("uname") || void 0;
      urlPhone = url2.searchParams.get("phone") || void 0;
      urlView = url2.searchParams.get("view") || void 0;
      urlCode = url2.searchParams.get("code") || void 0;
      const ref = url2.searchParams.get("ref");
      if (ref) sessionStorage.setItem("fk_ref", ref);
      if (tgId && Number.isFinite(tgId)) {
        urlTg = {
          id: tgId,
          first_name: name,
          username: uname
        };
      }
      if (urlPhone) sessionStorage.setItem("fk_tg_phone", urlPhone);
      if (urlCode) sessionStorage.setItem("fk_tg_code", urlCode);
      if (urlView) sessionStorage.setItem("fk_tg_view", urlView);
    } catch {
    }
    try {
      const w = window;
      const tg = w?.Telegram?.WebApp;
      if (tg) {
        tg.ready?.();
        tg.expand?.();
        const tgUser = tg.initDataUnsafe?.user;
        const startParam = tg.initDataUnsafe?.start_param;
        if (startParam) sessionStorage.setItem("fk_ref", startParam);
        if (tgUser?.id) urlTg = {
          id: tgUser.id,
          first_name: tgUser.first_name,
          username: tgUser.username
        };
      }
    } catch {
    }
    if (urlTg?.id) {
      const users = getUsers();
      const existing = users.find((u) => u.telegramId === urlTg.id);
      if (existing) {
        setSession(existing.username);
        notifyTelegram({
          chatId: urlTg.id,
          text: `👋 Welcome back <b>${existing.username}</b>!
💰 Current balance: <b>${fmtEtb(existing.balance)}</b>`
        });
      } else if (urlPhone) {
        const seq2 = Math.max(0, ...users.map((u) => u.seq ?? 0)) + 1;
        const ref = sessionStorage.getItem("fk_ref") || void 0;
        let referredBy;
        if (ref) {
          const inv = users.find((u) => u.username === ref || u.refCode === ref);
          if (inv) {
            inv.balance += REFERRAL_SIGNUP_BONUS;
            referredBy = inv.username;
          }
        }
        const uname = urlTg.username || `tg${urlTg.id}`;
        const takenIds = new Set(users.map((u) => u.userId6).filter(Boolean));
        const newUser = {
          username: uname,
          password: `tg_${urlTg.id}`,
          phone: urlPhone,
          balance: SIGNUP_BONUS,
          seq: seq2,
          userId6: genUserId6(takenIds, urlTg.id ?? urlPhone),
          games: 0,
          wins: 0,
          referredBy,
          firstDepositDone: false,
          refCode: `R${urlPhone.slice(-6)}${Math.floor(Math.random() * 75 + 10)}`,
          telegramId: urlTg.id
        };
        users.push(newUser);
        saveUsers(users);
        setSession(uname);
        addTx({
          id: `b${Date.now()}s`,
          username: uname,
          type: "bonus",
          subtype: "signup",
          amount: SIGNUP_BONUS,
          status: "approved",
          createdAt: Date.now(),
          note: "Welcome bonus"
        });
        if (referredBy) {
          addTx({
            id: `b${Date.now()}r`,
            username: referredBy,
            type: "bonus",
            subtype: "referral",
            amount: REFERRAL_SIGNUP_BONUS,
            status: "approved",
            createdAt: Date.now(),
            note: `Invited ${uname}`
          });
        }
        notifyTelegram({
          chatId: urlTg.id,
          text: `🎉 Welcome to <b>Adey Bingo</b>, ${urlTg.first_name ?? uname}!
🎁 +${SIGNUP_BONUS} ETB welcome bonus added.
💰 Current balance: <b>${fmtEtb(SIGNUP_BONUS)}</b>`,
          adminText: `🆕 New signup: <b>${uname}</b> · ${urlPhone} · tg:${urlTg.id}`
        });
      } else {
        try {
          sessionStorage.setItem("fk_tg", JSON.stringify(urlTg));
        } catch {
        }
      }
    }
    let current = getCurrentUser();
    if (!current) {
      const users = getUsers();
      current = users.find((u) => u.username === "player") ?? {
        username: "player",
        password: "",
        balance: 1e3,
        seq: 1,
        games: 0,
        wins: 0,
        firstDepositDone: true
      };
      if (!users.some((u) => u.username === current.username)) saveUsers([...users, current]);
      setSession(current.username);
    }
    setUser(current);
    try {
      const v = sessionStorage.getItem("fk_tg_view");
      if (v) {
        sessionStorage.removeItem("fk_tg_view");
        if (v === "wallet" || v === "deposit" || v === "withdraw") setView("wallet");
        else if (v === "redeem") setView("home");
      }
    } catch {
    }
    const id = setTimeout(() => setSplash(false), 1200);
    return () => clearTimeout(id);
  }, []);
  const refresh = () => {
    setUser(getCurrentUser());
    setTick((x) => x + 1);
  };
  if (splash) {
    return /* @__PURE__ */ jsxs("div", { className: "splash", children: [
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Fast Bingo", className: "h-20 w-auto" }),
      /* @__PURE__ */ jsx("div", { className: "splash-spinner" }),
      /* @__PURE__ */ jsx("div", { className: "text-primary font-bold tracking-wider text-sm", children: "FAST BINGO" }),
      /* @__PURE__ */ jsx("a", { href: "https://fastbingo-et.vercel.app", target: "_blank", rel: "noopener noreferrer", className: "text-xs text-primary/80 underline underline-offset-2 hover:text-primary", children: "fastbingo-et.vercel.app" })
    ] });
  }
  if (!user) return /* @__PURE__ */ jsx(AuthScreen, { onAuth: refresh, t, lang, setLang: setLang2 });
  const seq = user.seq ?? 1;
  254700 + seq * 47 + status.gameNo;
  const profileId = ensureUserId6(user);
  return /* @__PURE__ */ jsxs("div", { className: "h-dvh max-h-dvh overflow-hidden bg-background text-foreground flex flex-col", children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", position: "top-center", offset: "40vh", richColors: true, closeButton: true }),
    /* @__PURE__ */ jsx(Header, { user, t, lang, setLang: setLang2, onLogout: () => {
      setSession(null);
      setUser(null);
    }, roundId: profileId, countdown: status.countdown, drawing: status.drawing, drawnCount: status.drawnCount, soundOn, onToggleSound: toggleSound, onNavigate: setView, currentView: view }),
    /* @__PURE__ */ jsx(JoinTicker, {}),
    /* @__PURE__ */ jsx(InviteAdsRotator, { refCode: user.refCode || user.username }),
    /* @__PURE__ */ jsxs("main", { className: "flex-1 overflow-y-auto px-2 py-1 w-full", children: [
      view === "home" && /* @__PURE__ */ jsx(HomeView, { t, onPlay: () => setView("game"), onWallet: () => setView("wallet"), onNavigate: setView, user, onChange: refresh }),
      view === "help" && /* @__PURE__ */ jsx(HelpView, { t }),
      /* @__PURE__ */ jsx("div", { className: view === "game" ? "block" : "hidden", children: /* @__PURE__ */ jsx(GameView, { user, onChange: refresh, t, tick, status, setStatus, soundOn, isActive: view === "game" }) }),
      view === "wallet" && /* @__PURE__ */ jsx(WalletView, { user, onChange: refresh, t, initialScreen: walletScreen, onScreenChange: setWalletScreen }),
      view === "admin" && user.isAdmin && /* @__PURE__ */ jsx(AdminView, { t, onChange: refresh, user }),
      view === "history" && /* @__PURE__ */ jsx(HistoryView, { user, t }),
      view === "results" && /* @__PURE__ */ jsx(ResultsView, { t }),
      view === "stats" && /* @__PURE__ */ jsx(StatsView, { t }),
      view === "leaders" && /* @__PURE__ */ jsx(LeadersView, { t }),
      view === "me" && /* @__PURE__ */ jsx(MeView, { user, t, onNavigate: gotoWallet, onLogout: () => {
        setSession(null);
        setUser(null);
      } }),
      view === "invite" && /* @__PURE__ */ jsx(InviteView, { user, t })
    ] }),
    /* @__PURE__ */ jsxs("nav", { className: "shrink-0 grid grid-cols-3 bg-card border-t border-border sticky bottom-0 z-30 pb-[env(safe-area-inset-bottom)]", children: [
      /* @__PURE__ */ jsx(TabBtn, { active: view === "game", onClick: () => setView("game"), icon: /* @__PURE__ */ jsx("span", { className: "text-xl leading-none", children: "🏆" }), label: t("game") }),
      /* @__PURE__ */ jsx(TabBtn, { active: view === "invite", onClick: () => setView("invite"), icon: /* @__PURE__ */ jsx(Share2, { size: 20 }), label: t("invite") }),
      /* @__PURE__ */ jsx(TabBtn, { active: view === "me", onClick: () => setView("me"), icon: /* @__PURE__ */ jsx(User, { size: 20 }), label: t("profile") })
    ] })
  ] });
}
function TabBtn({
  active,
  onClick,
  icon,
  label
}) {
  return /* @__PURE__ */ jsxs("button", { onClick, className: `flex flex-col items-center justify-center py-2 text-xs gap-1 ${active ? "text-[#f5c518]" : "text-muted-foreground"}`, children: [
    icon,
    /* @__PURE__ */ jsx("span", { children: label })
  ] });
}
function Header({
  user,
  t,
  lang,
  setLang: setLang2,
  onLogout,
  roundId,
  countdown,
  drawing,
  drawnCount,
  soundOn,
  onToggleSound,
  onNavigate,
  currentView
}) {
  const [menu, setMenu] = useState(false);
  const go = (v) => {
    onNavigate(v);
    setMenu(false);
  };
  const items = [{
    v: "game",
    icon: /* @__PURE__ */ jsx(Play, { size: 16 }),
    label: t("game")
  }, {
    v: "results",
    icon: /* @__PURE__ */ jsx(Trophy, { size: 16 }),
    label: t("results")
  }, {
    v: "stats",
    icon: /* @__PURE__ */ jsx(BarChart3, { size: 16 }),
    label: t("statistics")
  }, {
    v: "leaders",
    icon: /* @__PURE__ */ jsx(Crown, { size: 16 }),
    label: t("leaders")
  }, {
    v: "history",
    icon: /* @__PURE__ */ jsx(History, { size: 16 }),
    label: t("history")
  }, {
    v: "wallet",
    icon: /* @__PURE__ */ jsx(Wallet, { size: 16 }),
    label: t("balance")
  }, {
    v: "me",
    icon: /* @__PURE__ */ jsx(User, { size: 16 }),
    label: t("me")
  }];
  return /* @__PURE__ */ jsxs("header", { className: "shrink-0 bg-card border-b border-border", children: [
    /* @__PURE__ */ jsxs("div", { className: "w-full flex items-center gap-2 px-2 py-1.5", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setMenu((m) => !m), className: "text-primary p-1", "aria-label": "menu", children: /* @__PURE__ */ jsx(Menu, { size: 22 }) }),
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Fast Keno", className: "h-7 w-auto" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 border border-primary/50 rounded-full px-2 py-0.5", children: [
        /* @__PURE__ */ jsx("span", { className: "text-primary font-bold text-sm", children: user.balance.toFixed(2) }),
        /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: "ETB" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 border rounded-full px-2 py-0.5 bg-secondary/40", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: "ID:" }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-foreground font-semibold", children: roundId }),
        /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { size: 9, className: "text-primary-foreground", strokeWidth: 4 }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx("button", { onClick: onToggleSound, className: `p-1.5 rounded-md border ${soundOn ? "text-primary border-primary/50 bg-primary/10" : "text-muted-foreground border-border"}`, "aria-label": soundOn ? "Sound off" : "Sound on", title: soundOn ? "Sound: ON (tap to mute)" : "Sound: OFF (tap to enable)", children: soundOn ? /* @__PURE__ */ jsx(Volume2, { size: 18 }) : /* @__PURE__ */ jsx(VolumeX, { size: 18 }) }) })
    ] }),
    currentView === "game" && /* @__PURE__ */ jsx("div", { className: "text-center text-primary font-bold tracking-[0.25em] text-sm pb-1.5", children: drawing ? `${drawnCount}/75` : `00 : ${countdown.toString().padStart(2, "0")}` }),
    menu && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-20", onClick: () => setMenu(false) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute left-2 top-12 bg-card border rounded-lg shadow-lg w-52 py-1 text-sm z-30", children: [
        items.map((it) => /* @__PURE__ */ jsxs("button", { onClick: () => go(it.v), className: `w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/50 ${currentView === it.v ? "text-primary" : ""}`, children: [
          it.icon,
          " ",
          it.label
        ] }, it.v)),
        user.isAdmin && /* @__PURE__ */ jsxs("button", { onClick: () => go("admin"), className: `w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/50 ${currentView === "admin" ? "text-primary" : ""}`, children: [
          /* @__PURE__ */ jsx(ShieldCheck, { size: 16 }),
          " ",
          t("admin")
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t my-1" }),
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          setLang2(lang === "am" ? "en" : "am");
          setMenu(false);
        }, className: "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/50", children: [
          /* @__PURE__ */ jsx(Languages, { size: 16 }),
          " ",
          lang === "am" ? "English" : "አማርኛ"
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          onLogout();
          setMenu(false);
        }, className: "w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-secondary/50 text-destructive", children: [
          /* @__PURE__ */ jsx(LogOut, { size: 16 }),
          " ",
          t("logout")
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "px-3 py-1.5 text-[11px] text-muted-foreground border-t", children: [
          user.username,
          user.phone ? ` · ${user.phone}` : ""
        ] })
      ] })
    ] })
  ] });
}
function AuthScreen({
  onAuth,
  t,
  lang,
  setLang: setLang2
}) {
  const [mode, setMode] = useState("login");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [referral, setReferral] = useState("");
  const [refLocked, setRefLocked] = useState(false);
  const [tgUser, setTgUser] = useState(null);
  useEffect(() => {
    try {
      const url2 = new URL(window.location.href);
      const ref = url2.searchParams.get("ref") || sessionStorage.getItem("fk_ref") || "";
      if (ref) {
        setReferral(ref);
        setRefLocked(true);
        setMode("register");
      }
      const p = url2.searchParams.get("phone") || sessionStorage.getItem("fk_tg_phone") || "";
      if (p) {
        setPhone(p);
        setMode("register");
      }
      const tgRaw = sessionStorage.getItem("fk_tg");
      if (tgRaw) {
        const u = JSON.parse(tgRaw);
        setTgUser(u);
        setMode("register");
        if (!password) setPassword(`tg_${u.id}`);
      }
    } catch {
    }
  }, []);
  const requestContact = () => {
    const tg = window?.Telegram?.WebApp;
    if (!tg?.requestContact) {
      toast.error("Open inside Telegram to share contact");
      return;
    }
    tg.requestContact((ok, data) => {
      if (!ok) return;
      const p = data?.responseUnsafe?.contact?.phone_number || data?.contact?.phone_number;
      if (p) setPhone(String(p).replace(/^\+/, ""));
    });
  };
  const genRefCode = (phone2) => `R${phone2.slice(-6)}${Math.floor(Math.random() * 75 + 10)}`;
  const submit = (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 9) return toast.error("Phone required");
    const users = getUsers();
    const existing = users.find((u) => u.phone === phone);
    if (existing) {
      if (existing.isAdmin) {
        if (!password || password !== existing.password) return toast.error("Wrong admin password");
      }
      setSession(existing.username);
      toast.success(`${t("welcome")} ${existing.username}`);
      try {
        sessionStorage.removeItem("fk_tg");
        sessionStorage.removeItem("fk_ref");
      } catch {
      }
      onAuth();
      return;
    }
    if (mode === "login") {
      return toast.error("Not registered — please register first");
    }
    if (!password) return toast.error("Password required");
    const seq = Math.max(0, ...users.map((u) => u.seq ?? 0)) + 1;
    let referredBy;
    if (referral.trim()) {
      const code = referral.trim();
      const inv = users.find((u) => u.username === code || u.refCode === code);
      if (inv) {
        inv.balance += REFERRAL_SIGNUP_BONUS;
        referredBy = inv.username;
      }
    }
    const username = tgUser?.username || `user${phone.slice(-4)}${seq}`;
    const takenIds = new Set(users.map((u) => u.userId6).filter(Boolean));
    const newUser = {
      username,
      password,
      phone,
      balance: SIGNUP_BONUS,
      seq,
      userId6: genUserId6(takenIds, tgUser?.id ?? phone),
      games: 0,
      wins: 0,
      referredBy,
      firstDepositDone: false,
      refCode: genRefCode(phone),
      telegramId: tgUser?.id
    };
    users.push(newUser);
    saveUsers(users);
    setSession(username);
    addTx({
      id: `b${Date.now()}s`,
      username,
      type: "bonus",
      subtype: "signup",
      amount: SIGNUP_BONUS,
      status: "approved",
      createdAt: Date.now(),
      note: "Welcome bonus"
    });
    if (referredBy) {
      addTx({
        id: `b${Date.now()}r`,
        username: referredBy,
        type: "bonus",
        subtype: "referral",
        amount: REFERRAL_SIGNUP_BONUS,
        status: "approved",
        createdAt: Date.now(),
        note: `Invited ${username}`
      });
    }
    try {
      sessionStorage.removeItem("fk_tg");
      sessionStorage.removeItem("fk_ref");
    } catch {
    }
    toast.success(`${t("welcome")} +${SIGNUP_BONUS} ETB`);
    onAuth();
  };
  return /* @__PURE__ */ jsxs("div", { className: "h-screen overflow-hidden bg-background flex flex-col items-center justify-center px-6", children: [
    /* @__PURE__ */ jsx(Toaster, { theme: "dark", position: "top-center" }),
    /* @__PURE__ */ jsx("button", { onClick: () => setLang2(lang === "am" ? "en" : "am"), className: "absolute top-4 right-4 text-xs px-2 py-1 rounded border text-muted-foreground", children: lang === "am" ? "EN" : "አማ" }),
    /* @__PURE__ */ jsx("img", { src: logo, alt: "Fast Bingo", className: "h-16 w-auto mb-6" }),
    mode === "register" && /* @__PURE__ */ jsxs("div", { className: "text-xs text-primary mb-3 font-semibold", children: [
      "🎁 ",
      t("bonus20")
    ] }),
    tgUser && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mb-3", children: [
      "👋 ",
      tgUser.first_name ?? "Player"
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "w-full max-w-xs space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("input", { className: "flex-1 bg-card border rounded-md px-3 py-2 text-sm", placeholder: t("phone"), type: "tel", value: phone, onChange: (e) => setPhone(e.target.value) }),
        mode === "register" && /* @__PURE__ */ jsx("button", { type: "button", onClick: requestContact, title: "Share contact", className: "px-2 bg-secondary border rounded-md text-primary", children: /* @__PURE__ */ jsx(Phone, { size: 16 }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx("input", { className: "w-full bg-card border rounded-md px-3 py-2 pr-10 text-sm", placeholder: t("password"), type: showPw ? "text" : "password", value: password, onChange: (e) => setPassword(e.target.value) }),
        /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPw((s) => !s), className: "absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground", children: showPw ? /* @__PURE__ */ jsx(EyeOff, { size: 16 }) : /* @__PURE__ */ jsx(Eye, { size: 16 }) })
      ] }),
      mode === "register" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("input", { className: "w-full bg-card border rounded-md px-3 py-2 text-sm disabled:opacity-60", placeholder: t("referral"), value: referral, onChange: (e) => setReferral(e.target.value), disabled: refLocked, readOnly: refLocked }),
        refLocked && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-primary -mt-1", children: [
          "✓ Invited by ",
          referral
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { className: "w-full bg-primary text-primary-foreground font-bold py-2.5 rounded-md", children: mode === "login" ? t("login") : t("register") }),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setMode(mode === "login" ? "register" : "login"), className: "w-full text-sm text-muted-foreground", children: mode === "login" ? t("register") : t("login") })
    ] })
  ] });
}
function fakePlayers(_seed) {
  return [];
}
function daubedSet(cartella, called) {
  const s = /* @__PURE__ */ new Set([12]);
  const callSet = new Set(called);
  cartella.forEach((n, i) => {
    if (i !== 12 && callSet.has(n)) s.add(i);
  });
  return s;
}
function GameView({
  user,
  onChange,
  t,
  status,
  setStatus,
  soundOn,
  isActive
}) {
  const soundOnRef = useRef(soundOn);
  const isActiveRef = useRef(isActive);
  const audibleRef = useRef(null);
  useEffect(() => {
    soundOnRef.current = soundOn;
    if (!soundOn) audibleRef.current?.pause();
  }, [soundOn]);
  useEffect(() => {
    isActiveRef.current = isActive;
    if (!isActive) audibleRef.current?.pause();
  }, [isActive]);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== "visible") audibleRef.current?.pause();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  const audioUnlockedRef = useRef(false);
  const audioUnlockPromiseRef = useRef(null);
  const createAudio = (src) => {
    const a = new Audio(src);
    a.preload = "auto";
    a.setAttribute("playsinline", "true");
    a.volume = 1;
    a.muted = false;
    return a;
  };
  const primeAudio = () => {
    if (audioUnlockedRef.current) return audioUnlockPromiseRef.current ?? Promise.resolve();
    if (audioUnlockPromiseRef.current) return audioUnlockPromiseRef.current;
    try {
      const a = createAudio("/sounds/B_1.mp3");
      a.muted = true;
      const unlockPromise = a.play().then(() => {
        audioUnlockedRef.current = true;
      }).catch(() => {
        audioUnlockedRef.current = false;
      }).finally(() => {
        try {
          a.pause();
          a.currentTime = 0;
          a.muted = false;
        } catch {
        }
        audioUnlockPromiseRef.current = null;
      });
      audioUnlockPromiseRef.current = unlockPromise;
      return unlockPromise;
    } catch {
      audioUnlockedRef.current = false;
      return Promise.resolve();
    }
  };
  useEffect(() => {
    const unlock = () => {
      void primeAudio();
    };
    const opts = {
      once: true,
      passive: true
    };
    window.addEventListener("pointerdown", unlock, opts);
    window.addEventListener("keydown", unlock, opts);
    window.addEventListener("touchstart", unlock, opts);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);
  const canPlay = () => soundOnRef.current && isActiveRef.current && (typeof document === "undefined" || document.visibilityState === "visible");
  const stopCurrentAudio = () => {
    const prev = audibleRef.current;
    if (prev) {
      try {
        prev.onended = null;
        prev.onerror = null;
        prev.pause();
      } catch {
      }
      audibleRef.current = null;
    }
  };
  const playOneShot = (src) => {
    if (!canPlay()) return;
    try {
      stopCurrentAudio();
      const a = createAudio(src);
      audibleRef.current = a;
      a.play().catch(() => {
      });
    } catch {
    }
  };
  const playAwaitable = (src, safetyMs) => {
    return new Promise((resolve) => {
      if (!canPlay()) {
        resolve();
        return;
      }
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      try {
        stopCurrentAudio();
        const a = createAudio(src);
        audibleRef.current = a;
        a.onended = finish;
        a.onerror = finish;
        a.play().catch(finish);
        setTimeout(finish, safetyMs);
      } catch {
        finish();
      }
    });
  };
  const playBallSound = (n) => {
    const letter = bingoLetter(n);
    return playAwaitable(`/sounds/${letter}_${n}.mp3`, 4e3);
  };
  const playIntroSound = () => playAwaitable("/sounds/Shekshik.mp3", 5e3);
  const playStartSound = () => playAwaitable("/sounds/Game_Start.mp3", 6e3);
  const playWinSound = () => playOneShot("/sounds/Good_Bingo.mp3");
  const playStopSound = () => playOneShot("/sounds/Game_Stop.mp3");
  const audioChainRef = useRef(Promise.resolve());
  const resetAudioChain = () => {
    audioChainRef.current = Promise.resolve();
  };
  const [cartella, setCartella] = useState(() => Array(25).fill(0));
  const [cartellaId, setCartellaId] = useState(null);
  const [cartella2, setCartella2] = useState(() => Array(25).fill(0));
  const [cartellaId2, setCartellaId2] = useState(null);
  const [autoDaub, setAutoDaub] = useState(false);
  const [daubedManual, setDaubedManual] = useState(() => /* @__PURE__ */ new Set([12]));
  const [cartOffset, setCartOffset] = useState({
    x: 0,
    y: 0
  });
  const cartDragRef = useRef(null);
  const onCartDragDown = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    cartDragRef.current = {
      sx: e.clientX,
      sy: e.clientY,
      ox: cartOffset.x,
      oy: cartOffset.y
    };
  };
  const onCartDragMove = (e) => {
    const d = cartDragRef.current;
    if (!d) return;
    setCartOffset({
      x: d.ox + e.clientX - d.sx,
      y: d.oy + e.clientY - d.sy
    });
  };
  const onCartDragUp = () => {
    cartDragRef.current = null;
  };
  const MIN_BET = 10;
  const HOUSE_CUT = 0.2;
  const POOL_PERCENT = 0.45;
  const [bet, setBet] = useState(MIN_BET);
  const [drawn, setDrawn] = useState([]);
  const [currentBall, setCurrentBall] = useState(null);
  const [ballKey, setBallKey] = useState(0);
  const [err, setErr] = useState(null);
  const [locked, setLocked] = useState(false);
  const [revealing, setRevealing] = useState(null);
  const [winner, setWinner] = useState(null);
  const lockedTicketRef = useRef(null);
  const runningRef = useRef(false);
  const sharedOrder = useMemo(() => drawOrderForGame(status.gameNo), [status.gameNo]);
  const focusJoinButton = () => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => /\b(Join|Play)\b/i.test(b.textContent || ""));
    btn?.focus?.();
  };
  const resetLobbyState = () => {
    setDrawn([]);
    setCurrentBall(null);
    setDaubedManual(/* @__PURE__ */ new Set([12]));
    setCartella(Array(25).fill(0));
    setCartella2(Array(25).fill(0));
    setCartellaId(null);
    setCartellaId2(null);
    lockedTicketRef.current = null;
    setLocked(false);
    setStakeChosen(false);
    onChange();
    setTimeout(focusJoinButton, 60);
  };
  const takenCartellas = useTakenCartellas(status.gameNo);
  const serverWinner = useGameWinner(status.gameNo);
  const effectiveDrawing = status.drawing && !serverWinner;
  const winClaimedRef = useRef(false);
  const STAKES = [10, 20, 50, 100];
  const [stakeChosen, setStakeChosen] = useState(false);
  const [spectator, setSpectator] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  useEffect(() => {
    setStakeChosen(false);
    setSpectator(false);
  }, [status.gameNo]);
  const pickStake = (amount) => {
    void primeAudio();
    if (!Number.isFinite(amount) || amount <= 0) {
      setErr("Enter a valid amount");
      return;
    }
    if (status.drawing) {
      setErr("Game already started");
      return;
    }
    const fresh = getCurrentUser();
    if (!fresh || fresh.balance < amount) {
      setErr(t("errInsufficient"));
      return;
    }
    updateUser({
      ...fresh,
      balance: fresh.balance - amount,
      games: (fresh.games ?? 0) + 1
    });
    setBet(amount);
    setStakeChosen(true);
    setLocked(true);
    logActivity({
      username: user.username,
      type: "play",
      detail: `joined ${amount} ETB`
    });
    onChange();
  };
  const [patternId, setPatternIdState] = useState("single_line");
  useEffect(() => {
    const pick = () => {
      const ids = getActivePatternIds();
      const rotate = getPatternRotate();
      if (ids.length > 0 && rotate) {
        const idx = Math.abs(status.gameNo) % ids.length;
        setPatternIdState(ids[idx]);
      } else if (ids.length > 0) {
        setPatternIdState(ids[0]);
      } else {
        setPatternIdState(getActivePattern());
      }
    };
    pick();
    const onStorage = () => pick();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [status.gameNo]);
  const pattern = useMemo(() => patternById(patternId), [patternId]);
  useEffect(() => {
    if (!err) return;
    const id = setTimeout(() => setErr(null), 3500);
    return () => clearTimeout(id);
  }, [err]);
  (user.seq ?? 1) * 47 + status.gameNo;
  const livePlayers = useLivePlayers();
  const players = useMemo(() => livePlayers.filter((p) => p.joined && p.stake === bet && p.gameNo === status.gameNo).map((p) => ({
    name: p.username,
    cartella: [],
    bet: p.stake
  })), [livePlayers, bet, status.gameNo]);
  const roundId = 254700 + (user.seq ?? 1) * 47 + status.gameNo;
  useEffect(() => {
    if (!user?.username) return;
    let cancelled = false;
    let id = 0;
    void import("./realtime-yvHaME7H.js").then((n) => n._).then(({
      trackPresence,
      untrackPresence
    }) => {
      if (cancelled) return;
      const beat = () => trackPresence({
        username: user.username,
        stake: bet,
        joined: stakeChosen,
        gameNo: status.gameNo
      });
      beat();
      id = window.setInterval(beat, 3e3);
      const onLeave = () => untrackPresence();
      window.addEventListener("beforeunload", onLeave);
      window.__fk_offLeave = () => window.removeEventListener("beforeunload", onLeave);
    });
    return () => {
      cancelled = true;
      if (id) window.clearInterval(id);
      void import("./realtime-yvHaME7H.js").then((n) => n._).then(({
        untrackPresence
      }) => untrackPresence());
    };
  }, [user?.username, stakeChosen, bet, status.gameNo]);
  useEffect(() => {
    runningRef.current = status.drawing;
    if (!status.drawing) {
      setDrawn((prev) => prev.length === 0 ? prev : []);
      setCurrentBall(null);
      setWinner(null);
      setRevealing(null);
      resetLobbyState();
    }
  }, [status.drawing]);
  const prevDrawingRef = useRef(false);
  const lastSpokenBallRef = useRef(null);
  useEffect(() => {
    const wasDrawing = prevDrawingRef.current;
    const nowDrawing = effectiveDrawing;
    prevDrawingRef.current = nowDrawing;
    if (!wasDrawing && nowDrawing) {
      lastSpokenBallRef.current = null;
      resetAudioChain();
      setDrawn([]);
      setCurrentBall(null);
      void primeAudio().then(() => {
        if (!canPlay()) return;
        void playIntroSound();
        void playStartSound();
      });
    }
    if (wasDrawing && !nowDrawing) {
      lastSpokenBallRef.current = null;
      if (canPlay()) playStopSound();
      return;
    }
    if (nowDrawing) {
      const nextDrawn = sharedOrder.slice(0, status.drawnCount);
      const latest = nextDrawn.length > 0 ? nextDrawn[nextDrawn.length - 1] : null;
      if (latest != null && latest !== lastSpokenBallRef.current) {
        lastSpokenBallRef.current = latest;
        setCurrentBall(latest);
        setDrawn(nextDrawn);
        setBallKey((k) => k + 1);
        if (canPlay()) {
          stopCurrentAudio();
          void playBallSound(latest);
        }
      }
    }
  }, [effectiveDrawing, status.drawnCount, sharedOrder]);
  useEffect(() => {
    winClaimedRef.current = false;
  }, [status.gameNo]);
  useEffect(() => {
    if (!effectiveDrawing) return;
    if (winClaimedRef.current) return;
    if (cartellaId == null) return;
    if (drawn.length === 0) return;
    const slots = [{
      id: cartellaId,
      cart: cartella
    }];
    if (cartellaId2 != null) slots.push({
      id: cartellaId2,
      cart: cartella2
    });
    const winSlot = slots.find((s) => checkWin(pattern, daubedSet(s.cart, drawn)));
    if (!winSlot) return;
    winClaimedRef.current = true;
    let pool = 0;
    for (const t2 of takenCartellas.values()) pool += t2.stake;
    if (pool === 0) pool = bet;
    const payout = Math.floor(pool * POOL_PERCENT);
    void claimWinner({
      gameNo: status.gameNo,
      username: user.username,
      cartellaId: winSlot.id,
      patternId: pattern.id,
      payout,
      drawnCount: drawn.length
    }).then((iWon) => {
      if (!iWon) return;
      const u2 = getCurrentUser();
      if (u2) {
        updateUser({
          ...u2,
          balance: u2.balance + payout,
          wins: (u2.wins ?? 0) + 1
        });
        addProfit(bet - payout);
      }
      addHistory({
        id: String(Date.now()),
        picks: winSlot.cart.filter((n) => n > 0),
        drawn: drawn.slice(),
        hits: winSlot.cart.filter((n) => drawn.includes(n)).length,
        bet,
        payout,
        at: Date.now(),
        username: user.username
      });
      logActivity({
        username: user.username,
        type: "win",
        detail: `+${payout} ETB · ${pattern.label}`
      });
      toast.success(`${t("won")} +${payout} ETB`);
      onChange();
    });
  }, [drawn, effectiveDrawing, cartellaId, cartellaId2, status.gameNo]);
  useEffect(() => {
    if (!serverWinner) return;
    const isMe = serverWinner.username === user.username;
    if (!isMe) {
      toast.message(`🏆 ${serverWinner.username} won game #${serverWinner.game_no} (+${Math.floor(serverWinner.payout)} ETB)`);
    }
    if (canPlay()) playStopSound();
    setWinner({
      name: serverWinner.username.toUpperCase(),
      cartella: serverWinner.username === user.username ? cartella : cartellaById(serverWinner.cartella_id),
      drawn: drawn.slice(),
      bet,
      ticketId: 254700 + (user.seq ?? 1) * 47 + serverWinner.game_no,
      patternLabel: pattern.label
    });
    console.debug("[bingo] serverWinner announced", serverWinner?.username, "game", serverWinner?.game_no);
    if (canPlay()) playWinSound();
    const id = window.setTimeout(() => setWinner(null), 3e3);
    console.debug("[bingo] scheduled clear winner in 3000ms", id);
    return () => window.clearTimeout(id);
  }, [serverWinner?.game_no]);
  const prevWinnerRef2 = useRef(null);
  useEffect(() => {
    if (prevWinnerRef2.current && !winner) {
      console.debug("[bingo] winner cleared, resetting UI and focusing Join button");
      setDrawn([]);
      setCurrentBall(null);
      setDaubedManual(/* @__PURE__ */ new Set([12]));
      setCartella(Array(25).fill(0));
      setCartella2(Array(25).fill(0));
      setCartellaId(null);
      setCartellaId2(null);
      lockedTicketRef.current = null;
      setLocked(false);
      setStakeChosen(false);
      onChange();
      setTimeout(() => {
        const btn = Array.from(document.querySelectorAll("button")).find((b) => /\b(Join|Play)\b/i.test(b.textContent || ""));
        btn?.focus?.();
      }, 60);
    }
    prevWinnerRef2.current = winner;
  }, [winner]);
  const pickCartella = async (id) => {
    if (status.drawing) return;
    if (id === cartellaId2) {
      toast.error("Already your 2nd card");
      return;
    }
    if (takenCartellas.has(id)) {
      const owner = takenCartellas.get(id);
      if (owner && owner.username !== user.username) {
        toast.error(`Cartella #${id} taken by ${owner.username}`);
        return;
      }
    }
    const ok = await claimCartella(status.gameNo, id, user.username, bet);
    if (!ok) {
      toast.error(`Cartella #${id} just got taken`);
      return;
    }
    setCartellaId(id);
    const cart = cartellaById(id);
    setCartella(cart);
    setDaubedManual(/* @__PURE__ */ new Set([12]));
    lockedTicketRef.current = {
      cartella: [...cart],
      bet
    };
  };
  const clearCartella = () => {
    if (status.drawing) return;
    const id = cartellaId;
    setCartellaId(null);
    setCartella(Array(25).fill(0));
    setDaubedManual(/* @__PURE__ */ new Set([12]));
    lockedTicketRef.current = null;
    if (id != null) void releaseCartella(status.gameNo, id, user.username);
  };
  const daubed = autoDaub ? daubedSet(cartella, drawn) : daubedManual;
  const toggleDaub = (idx) => {
    if (idx === 12) return;
    if (autoDaub) return;
    setDaubedManual((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };
  if (!stakeChosen && !spectator) {
    const stakeColor = (s) => s === 10 ? "from-cyan-400 to-cyan-600" : s === 20 ? "from-amber-400 to-orange-500" : s === 50 ? "from-emerald-400 to-green-600" : "from-fuchsia-400 to-purple-600";
    return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[70px_50px_50px_1fr_65px] sm:grid-cols-[110px_70px_70px_1fr_90px] text-[10px] sm:text-[11px] tracking-widest text-primary font-bold px-2 sm:px-3 py-2 border-b border-border", children: [
          /* @__PURE__ */ jsx("span", { children: "MEDEB" }),
          /* @__PURE__ */ jsx("span", { children: "DERASH" }),
          /* @__PURE__ */ jsx("span", { children: "PLAYERS" }),
          /* @__PURE__ */ jsx("span", { children: "STATUS" }),
          /* @__PURE__ */ jsx("span", { className: "text-right", children: "ACTION" })
        ] }),
        STAKES.map((s) => {
          const stakeCount = livePlayers.filter((p) => p.joined && p.stake === s && p.gameNo === status.gameNo).length;
          const isActive2 = bet === s && stakeCount > 0;
          const liveBet = stakeCount * s;
          const pool = Math.floor(liveBet * POOL_PERCENT);
          return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[70px_50px_50px_1fr_65px] sm:grid-cols-[110px_70px_70px_1fr_90px] items-center px-2 sm:px-3 py-1.5 sm:py-2 border-b border-border last:border-b-0", children: [
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("span", { className: `inline-flex items-center justify-center min-w-[50px] sm:min-w-[80px] px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-black text-black bg-gradient-to-b ${stakeColor(s)} shadow-md text-xs sm:text-sm`, children: [
              "ብር ",
              s
            ] }) }),
            /* @__PURE__ */ jsxs("span", { className: "text-foreground text-xs sm:text-sm", children: [
              pool,
              " ETB"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-foreground text-xs sm:text-sm flex items-center gap-1", children: [
              /* @__PURE__ */ jsx("span", { className: "inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" }),
              stakeCount
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-foreground text-xs sm:text-sm truncate", children: status.drawing ? "Active" : stakeCount > 0 ? "Waiting" : "Open" }),
            /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsx("button", { onClick: () => pickStake(s), className: "px-2 sm:px-4 py-1 sm:py-1.5 rounded-md bg-gradient-to-b from-cyan-300 to-cyan-500 text-black font-bold text-xs sm:text-sm shadow hover:brightness-110", children: isActive2 ? "Play" : "Join" }) })
          ] }, s);
        })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border border-border rounded-lg p-2 sm:p-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-[10px] sm:text-xs font-bold text-primary tracking-widest shrink-0", children: "CUSTOM" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center gap-1 bg-background border border-border rounded-md px-2 py-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "ብር" }),
          /* @__PURE__ */ jsx("input", { type: "number", inputMode: "numeric", min: 1, placeholder: "Enter amount", value: customAmount, onChange: (e) => setCustomAmount(e.target.value.replace(/[^\d.]/g, "")), className: "flex-1 bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground/60 w-full" })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => {
          const amt = Number(customAmount);
          if (!Number.isFinite(amt) || amt <= 0) {
            setErr("Enter a valid amount");
            return;
          }
          pickStake(amt);
        }, className: "px-3 sm:px-4 py-1.5 rounded-md bg-gradient-to-b from-cyan-300 to-cyan-500 text-black font-bold text-xs sm:text-sm shadow hover:brightness-110 shrink-0", children: "Join" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-2 justify-center items-stretch", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => {
          setSpectator(true);
          toast.message("Watching as spectator · no balance deducted");
        }, className: "group relative overflow-hidden px-5 py-3 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white font-bold text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" }),
          /* @__PURE__ */ jsx("span", { className: "relative inline-flex w-2 h-2 rounded-full bg-emerald-300 animate-pulse" }),
          /* @__PURE__ */ jsx("span", { className: "relative", children: "Enter Room · Watch Only" }),
          /* @__PURE__ */ jsx("span", { className: "relative text-[10px] opacity-80 px-1.5 py-0.5 rounded bg-white/15 border border-white/20", children: "FREE" })
        ] }),
        /* @__PURE__ */ jsxs("button", { onClick: () => setShowInfo(true), className: "px-4 py-2 rounded-xl bg-card border border-border text-sm text-foreground flex items-center justify-center gap-2 hover:bg-accent transition", children: [
          /* @__PURE__ */ jsx("span", { children: "ℹ️" }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Game Information" })
        ] })
      ] }),
      showInfo && /* @__PURE__ */ jsx(GameInfoModal, { onClose: () => setShowInfo(false), roundId, gameNo: status.gameNo, stakes: STAKES, players: players.length, houseCut: HOUSE_CUT, pattern: pattern.label, status: status.drawing ? "Active" : `Starts in 00:${status.countdown.toString().padStart(2, "0")}` })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
    err && /* @__PURE__ */ jsxs("div", { className: "err-banner flex items-center gap-2 px-3 py-1.5 text-sm", children: [
      /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full border border-current/60 flex items-center justify-center text-xs", children: "✕" }),
      /* @__PURE__ */ jsx("span", { className: "flex-1", children: err }),
      /* @__PURE__ */ jsx("button", { onClick: () => setErr(null), className: "opacity-70 hover:opacity-100", children: "✕" })
    ] }),
    (spectator || stakeChosen && !status.drawing) && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-transparent border border-violet-500/30", children: [
      spectator ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-flex w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-violet-200", children: "Spectator mode" }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "· no balance deducted" })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs sm:text-sm", children: [
        /* @__PURE__ */ jsx("span", { className: "font-bold text-primary", children: "Joined" }),
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "· ",
          bet,
          " ETB locked in"
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => {
        if (spectator) {
          setSpectator(false);
          void import("./realtime-yvHaME7H.js").then((n) => n._).then(({
            untrackPresence
          }) => untrackPresence());
          toast.message("Left room");
          return;
        }
        if (status.drawing) {
          setErr("Cannot cancel — drawing started");
          return;
        }
        const u = getCurrentUser();
        if (u) updateUser({
          ...u,
          balance: u.balance + bet,
          games: Math.max(0, (u.games ?? 1) - 1)
        });
        setStakeChosen(false);
        setLocked(false);
        setCartellaId(null);
        setCartella(Array(25).fill(0));
        lockedTicketRef.current = null;
        void import("./realtime-yvHaME7H.js").then((n) => n._).then(({
          untrackPresence
        }) => untrackPresence());
        toast.success(`Refunded ${bet} ETB`);
        logActivity({
          username: user.username,
          type: "play",
          detail: `cancelled ${bet} ETB · refunded`
        });
        onChange();
      }, className: "px-3 py-1.5 rounded-md bg-card border border-border text-xs font-bold hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition", children: spectator ? "Leave Room" : "Cancel & Refund" })
    ] }),
    (() => {
      const cartellaStakes = Array.from(takenCartellas.values()).reduce((s, t2) => s + (t2.stake || 0), 0);
      const presenceStakes = players.reduce((s, p) => s + p.bet, 0);
      const liveBetTotal = cartellaStakes > 0 ? cartellaStakes : presenceStakes;
      const pool = Math.floor(liveBetTotal * POOL_PERCENT);
      const names = /* @__PURE__ */ new Set();
      for (const t2 of takenCartellas.values()) names.add(t2.username);
      for (const p of players) names.add(p.name);
      const livePlayerCount = names.size;
      const locked2 = lockedTicketRef.current;
      const lockedDaubed = locked2 ? daubedSet(locked2.cartella, drawn).size + 1 : 0;
      const patternTarget = (() => {
        const m = previewMask(pattern);
        return m.filter(Boolean).length || 5;
      })();
      const progress = locked2 ? Math.min(100, Math.round(lockedDaubed / patternTarget * 100)) : 0;
      return /* @__PURE__ */ jsxs("div", { className: "hud-bar", children: [
        /* @__PURE__ */ jsxs("div", { className: "hud-cell hud-pool", children: [
          /* @__PURE__ */ jsx("div", { className: "hud-label", children: "POOL" }),
          /* @__PURE__ */ jsxs("div", { className: "hud-value", children: [
            pool,
            /* @__PURE__ */ jsx("span", { className: "hud-unit", children: " ETB" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hud-divider" }),
        /* @__PURE__ */ jsxs("div", { className: "hud-cell", children: [
          /* @__PURE__ */ jsx("div", { className: "hud-label", children: "PLAYERS" }),
          /* @__PURE__ */ jsx("div", { className: "hud-value hud-value-sm", children: livePlayerCount })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hud-divider" }),
        /* @__PURE__ */ jsxs("div", { className: "hud-cell", children: [
          /* @__PURE__ */ jsx("div", { className: "hud-label", children: status.drawing ? "DRAWN" : "STARTS IN" }),
          /* @__PURE__ */ jsx("div", { className: "hud-value hud-value-sm", children: status.drawing ? `${status.drawnCount}/75` : `00:${status.countdown.toString().padStart(2, "0")}` })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hud-divider" }),
        /* @__PURE__ */ jsxs("div", { className: "hud-cell hud-pattern", children: [
          /* @__PURE__ */ jsx("div", { className: "hud-label", children: "PATTERN" }),
          /* @__PURE__ */ jsx("div", { className: "hud-value hud-value-xs", children: pattern.label }),
          locked2 && status.drawing && /* @__PURE__ */ jsx("div", { className: "hud-progress", children: /* @__PURE__ */ jsx("div", { className: "hud-progress-fill", style: {
            width: `${progress}%`
          } }) })
        ] })
      ] });
    })(),
    status.drawing ? /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-2 relative overflow-visible flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "rings" }),
      /* @__PURE__ */ jsx("div", { className: "relative flex items-center justify-center h-28", children: currentBall !== null && /* @__PURE__ */ jsxs("div", { className: "keno-ball big ball-pop flex-col leading-none relative z-10", style: ballStyle(currentBall), children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] opacity-90 font-black tracking-wider", children: bingoLetter(currentBall) }),
        /* @__PURE__ */ jsx("span", { children: currentBall })
      ] }, ballKey) }),
      /* @__PURE__ */ jsx("div", { className: "bingo-board mx-auto", style: {
        padding: 3,
        gap: 3,
        maxWidth: 360
      }, children: ["B", "I", "N", "G", "O"].map((L) => /* @__PURE__ */ jsx("div", { className: "bingo-board-head", style: {
        background: BINGO_COL_BG[L]
      }, children: L }, L)) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card/60 border rounded-md p-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] font-bold tracking-widest text-muted-foreground mb-1", children: [
          "CALLED (",
          drawn.length,
          ")"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 max-h-20 overflow-y-auto", children: drawn.length === 0 ? /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground", children: "—" }) : drawn.map((n) => /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center justify-center min-w-[28px] h-6 px-1 rounded text-[11px] font-bold text-white", style: {
          background: BINGO_COL_BG[bingoLetter(n)]
        }, children: [
          bingoLetter(n),
          n
        ] }, n)) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bingo-board mx-auto", style: {
        maxWidth: 360
      }, children: ["B", "I", "N", "G", "O"].map((L, ci) => {
        const start = ci * 15 + 1;
        const nums = Array.from({
          length: 15
        }, (_, i) => start + i);
        return /* @__PURE__ */ jsx("div", { className: "bingo-board-col", children: nums.map((n) => {
          const called = drawn.includes(n);
          const isCurrent = currentBall === n;
          return /* @__PURE__ */ jsx("div", { className: `bingo-board-cell ${called ? "called" : ""} ${isCurrent ? "current" : ""}`, children: n }, n);
        }) }, L);
      }) }),
      lockedTicketRef.current && /* @__PURE__ */ jsxs("div", { className: "absolute z-40 left-2 top-2 w-[240px] rounded-md bg-white shadow-xl ring-2 ring-primary/60 p-1 touch-none select-none", style: {
        transform: `translate(${cartOffset.x}px, ${cartOffset.y}px)`,
        willChange: "transform"
      }, children: [
        /* @__PURE__ */ jsx("button", { type: "button", onPointerDown: onCartDragDown, onPointerMove: onCartDragMove, onPointerUp: onCartDragUp, onPointerCancel: onCartDragUp, className: "absolute -top-2 -right-2 z-50 bg-primary text-primary-foreground rounded-full p-1 shadow cursor-grab active:cursor-grabbing", title: "Drag cartella", "aria-label": "Drag cartella", children: /* @__PURE__ */ jsx(Move, { size: 12 }) }),
        /* @__PURE__ */ jsx(CartellaGrid, { cartella: lockedTicketRef.current.cartella, daubed: daubedSet(lockedTicketRef.current.cartella, drawn), onTap: () => {
        } })
      ] })
    ] }) : winner ? null : revealing ? /* @__PURE__ */ jsxs("div", { className: `bg-card border-2 rounded-lg p-2 space-y-2 ${revealing.won ? "border-primary pulse-glow" : "border-border"}`, children: [
      /* @__PURE__ */ jsxs("div", { className: `text-center text-sm font-bold ${revealing.won ? "text-primary" : "text-muted-foreground"}`, children: [
        revealing.won ? t("won") : t("lost"),
        " · ",
        pattern.label
      ] }),
      /* @__PURE__ */ jsx(CartellaGrid, { cartella: revealing.cartella, daubed: daubedSet(revealing.cartella, revealing.drawn), onTap: () => {
      } }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1 justify-center pt-1 border-t border-border", children: revealing.drawn.map((n, i) => /* @__PURE__ */ jsx("div", { className: "keno-ball w-7 h-7 text-[11px]", style: ballStyle(n), children: n }, `${n}-${i}`)) })
    ] }) : spectator ? /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-6 text-center text-sm text-muted-foreground", children: "You are watching this room. The next draw will appear here live." }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "flex gap-1 items-stretch", children: /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: cartellaId === null ? /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-medium", children: [
            "ካርቴላ ይምረጡ (",
            bet,
            " ብር)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-primary text-xs font-bold", children: "0/1" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "cart-grid lined", children: Array.from({
          length: 75
        }, (_, i) => i + 1).map((n) => {
          const owner = takenCartellas.get(n);
          const mine = owner?.username === user.username;
          const taken = !!owner && !mine;
          return /* @__PURE__ */ jsx("button", { onClick: () => pickCartella(n), disabled: taken, title: taken ? `Taken by ${owner?.username}` : void 0, className: `cart-cell ${taken ? "opacity-30 cursor-not-allowed line-through" : ""}`, children: n }, n);
        }) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] font-medium", children: [
            "ካርቴላ #",
            cartellaId,
            " (",
            bet,
            " ብር)"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxs("button", { onClick: () => downloadCartellaPdf({
              cartella,
              cartellaId,
              username: user.username,
              bet,
              patternLabel: pattern.label
            }), className: "text-[10px] text-primary border border-primary/50 rounded-md px-2 py-0.5 flex items-center gap-1", title: "Download cartella as PDF", children: [
              /* @__PURE__ */ jsx(Printer, { size: 11 }),
              " PDF"
            ] }),
            /* @__PURE__ */ jsx("button", { onClick: clearCartella, disabled: status.drawing, className: "text-[10px] text-primary border border-primary/50 rounded-md px-2 py-0.5 disabled:opacity-40", children: "ቀይር" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "bg-card border rounded-lg p-2 relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2 items-start", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative touch-none select-none", style: {
            transform: `translate(${cartOffset.x}px, ${cartOffset.y}px)`,
            willChange: "transform"
          }, children: [
            /* @__PURE__ */ jsx("button", { type: "button", onPointerDown: onCartDragDown, onPointerMove: onCartDragMove, onPointerUp: onCartDragUp, onPointerCancel: onCartDragUp, className: "absolute -top-1 -right-1 z-30 bg-primary text-primary-foreground rounded-full p-1 shadow cursor-grab active:cursor-grabbing", title: "Drag to move cartella", "aria-label": "Drag cartella", children: /* @__PURE__ */ jsx(Move, { size: 12 }) }),
            /* @__PURE__ */ jsx(CartellaGrid, { cartella, daubed, onTap: toggleDaub, small: true }),
            (cartOffset.x !== 0 || cartOffset.y !== 0) && /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setCartOffset({
              x: 0,
              y: 0
            }), className: "absolute -top-1 -left-1 z-30 bg-secondary text-foreground rounded-full p-1 shadow text-[9px]", title: "Reset position", "aria-label": "Reset cartella position", children: /* @__PURE__ */ jsx(X, { size: 10 }) }),
            /* @__PURE__ */ jsxs("label", { className: "flex items-center gap-1 mt-1 text-[10px] text-muted-foreground", children: [
              /* @__PURE__ */ jsx("input", { type: "checkbox", checked: autoDaub, onChange: (e) => setAutoDaub(e.target.checked), className: "accent-primary" }),
              "Auto-daub"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "cart-grid lined", children: Array.from({
            length: 75
          }, (_, i) => i + 1).map((n) => {
            const owner = takenCartellas.get(n);
            const mine = owner?.username === user.username;
            const taken = !!owner && !mine;
            return /* @__PURE__ */ jsx("button", { onClick: () => pickCartella(n), disabled: taken, title: taken ? `Taken by ${owner?.username}` : void 0, className: `cart-cell ${cartellaId === n ? "sel" : ""} ${taken ? "opacity-30 cursor-not-allowed line-through" : ""}`, children: n }, n);
          }) })
        ] }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("div", { className: "w-full text-center py-2 rounded-md bg-card border text-xs text-muted-foreground", children: cartellaId === null ? "ካርቴላ ይምረጡ" : `Joined · ${bet} ETB · ካርቴላ #${cartellaId} · 🟢 ${players.length} live` })
    ] }),
    winner && /* @__PURE__ */ jsx(BingoWinnerOverlay, { winner, t })
  ] });
}
function GameInfoModal({
  onClose,
  roundId,
  gameNo,
  stakes,
  players,
  houseCut,
  pattern,
  status
}) {
  return /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", onClick: onClose, children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-sm bg-card border border-border rounded-xl shadow-2xl overflow-hidden", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/20 to-transparent", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-lg", children: "ℹ️" }),
        /* @__PURE__ */ jsx("span", { className: "font-bold text-foreground", children: "Game Information" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: onClose, className: "w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-3 text-sm", children: [
      /* @__PURE__ */ jsx(InfoRow, { label: "Round ID", value: `#${roundId}` }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Game No", value: `${gameNo}` }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Status", value: status }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Pattern", value: pattern }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Players", value: `${players}` }),
      /* @__PURE__ */ jsx(InfoRow, { label: "Stakes", value: stakes.map((s) => `${s} Br`).join(" · ") }),
      /* @__PURE__ */ jsx(InfoRow, { label: "House Cut", value: `${Math.round(houseCut * 100)}%` }),
      /* @__PURE__ */ jsxs("div", { className: "pt-2 border-t border-border text-xs text-muted-foreground leading-relaxed", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold text-foreground mb-1", children: "How it works" }),
        /* @__PURE__ */ jsxs("ul", { className: "list-disc pl-4 space-y-1", children: [
          /* @__PURE__ */ jsx("li", { children: "Pick a stake (Medeb), choose a cartella, then wait for the draw." }),
          /* @__PURE__ */ jsx("li", { children: "Mark called numbers on your card. Complete the pattern to win." }),
          /* @__PURE__ */ jsx("li", { children: "Prize pool = total stakes minus house cut, paid to the winner." }),
          /* @__PURE__ */ jsx("li", { children: "Tap BINGO the moment your pattern is complete." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-t border-border", children: /* @__PURE__ */ jsx("button", { onClick: onClose, className: "w-full py-2 rounded-md bg-primary text-primary-foreground font-bold hover:brightness-110", children: "Got it" }) })
  ] }) });
}
function InfoRow({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold", children: value })
  ] });
}
function CartellaGrid({
  cartella,
  daubed,
  onTap,
  small,
  flush
}) {
  return /* @__PURE__ */ jsxs("div", { className: flush ? "winner-card-flush" : "winner-card mx-auto", style: {
    maxWidth: small ? 160 : 220
  }, children: [
    /* @__PURE__ */ jsx("div", { className: "bingo-col-head", children: ["B", "I", "N", "G", "O"].map((L) => /* @__PURE__ */ jsx("div", { style: {
      background: BINGO_COL_BG[L]
    }, children: L }, L)) }),
    /* @__PURE__ */ jsx("div", { className: "bingo-grid", children: cartella.map((n, i) => {
      const free = i === 12;
      const hit = free || daubed.has(i);
      return /* @__PURE__ */ jsx("button", { onClick: () => onTap(i), className: `bingo-cell ${hit ? "hit" : ""} ${free ? "free" : ""}`, children: free ? "★" : n || "" }, i);
    }) })
  ] });
}
function WalletView({
  user,
  onChange,
  t,
  initialScreen = "main",
  onScreenChange
}) {
  const [screen, setScreenState] = useState(initialScreen);
  const setScreen = (s) => {
    setScreenState(s);
    onScreenChange?.(s);
  };
  useEffect(() => {
    setScreenState(initialScreen);
  }, [initialScreen]);
  const [method, setMethod] = useState("telebirr");
  const [amount, setAmount] = useState(100);
  const [account, setAccount] = useState(user.phone || "");
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [code, setCode] = useState("");
  const [txTab, setTxTab] = useState("deposit");
  const [myTx, setMyTx] = useState([]);
  const [timer, setTimer] = useState(180);
  const [depStep, setDepStep] = useState(1);
  const [depTimer, setDepTimer] = useState(180);
  const [smsText, setSmsText] = useState("");
  const pay = getPayInfo();
  const rounds = useMemo(() => getHistory().filter((r) => r.username === user.username), [user.username, screen, txTab]);
  useEffect(() => {
    setMyTx(getTx().filter((x) => x.username === user.username));
  }, [user.username, screen]);
  useEffect(() => {
    if (screen !== "deposit") return;
    setDepStep(1);
    setSmsText("");
  }, [screen]);
  useEffect(() => {
    if (screen !== "deposit" || depStep !== 3) return;
    setDepTimer(180);
    const id = setInterval(() => setDepTimer((v) => v <= 0 ? 0 : v - 1), 1e3);
    return () => clearInterval(id);
  }, [screen, depStep]);
  useEffect(() => {
    if (screen !== "withdraw-form") return;
    setTimer(180);
    const id = setInterval(() => setTimer((v) => v <= 0 ? 0 : v - 1), 1e3);
    return () => clearInterval(id);
  }, [screen]);
  const wagered = useMemo(() => getHistory().filter((h) => h.username === user.username).reduce((s, h) => s + (h.bet ?? 0), 0), [user.username]);
  useMemo(() => myTx.filter((x) => x.type === "deposit" && x.status === "approved").reduce((s, x) => s + (x.amount ?? 0), 0), [myTx]);
  const wagerRequired = WAGER_REQUIREMENT;
  const wagerLock = Math.max(0, wagerRequired - wagered);
  const bonusLock = wagerLock;
  const withdrawable = Math.max(0, user.balance - wagerLock);
  const playBalance = user.balance;
  user.telegramId;
  const submitDeposit = () => {
    if (amount <= 0) return;
    if (!smsText.trim()) return toast.error("Paste the SMS confirmation");
    addTx({
      id: String(Date.now()),
      username: user.username,
      phone: user.phone,
      method,
      type: "deposit",
      amount,
      status: "pending",
      createdAt: Date.now(),
      note: `SMS: ${smsText.trim().slice(0, 500)}`
    });
    notifyTelegram({
      text: `💰 <b>Deposit request received</b>
Amount: <b>${fmtEtb(amount)}</b> via ${method.toUpperCase()}
Current balance: <b>${fmtEtb(user.balance)}</b>
Status: ⏳ pending admin approval. You'll get a message here once approved.`,
      adminText: `🟡 <b>Deposit pending</b>
User: <b>${user.username}</b> · ${user.phone ?? "-"}
Amount: <b>${fmtEtb(amount)}</b> via ${method.toUpperCase()}
SMS: ${smsText.trim().slice(0, 500)}`
    });
    toast.success("Deposit submitted successfully — pending approval");
    setScreen("main");
    onChange();
  };
  const submitWithdraw = () => {
    if (amount <= 0) return;
    if (!account) return toast.error("Account required");
    if (withdrawable < amount) return toast.error(t("insufficient"));
    if (timer === 0) return toast.error("Session expired");
    addTx({
      id: String(Date.now()),
      username: user.username,
      phone: account,
      method,
      type: "withdraw",
      amount,
      status: "pending",
      createdAt: Date.now()
    });
    notifyTelegram({
      text: `💸 <b>Withdrawal request received</b>
Amount: <b>${fmtEtb(amount)}</b> to ${method.toUpperCase()} ${account}
Current balance: <b>${fmtEtb(user.balance)}</b>
Status: ⏳ pending admin approval.`,
      adminText: `🟠 <b>Withdraw pending</b>
User: <b>${user.username}</b>
Amount: <b>${fmtEtb(amount)}</b> → ${method.toUpperCase()} ${account}`
    });
    toast.success(t("requestSent"));
    setScreen("main");
    onChange();
  };
  const redeem = () => {
    if (!code.trim()) return;
    const r = redeemCoupon(code, user.username);
    if (r.ok) {
      toast.success(r.msg);
      const fresh = getCurrentUser();
      addTx({
        id: `b${Date.now()}c`,
        username: user.username,
        type: "bonus",
        subtype: "coupon",
        amount: r.amount ?? 0,
        status: "approved",
        createdAt: Date.now(),
        note: `Code ${code.toUpperCase()}`
      });
      notifyTelegram({
        text: `🎟️ <b>Coupon redeemed!</b>
Code: <code>${code.toUpperCase()}</code>
Added: <b>+${r.amount} ETB</b>
New balance: <b>${fmtEtb(fresh?.balance ?? user.balance)}</b>`
      });
      setCode("");
      setRedeemOpen(false);
      onChange();
    } else toast.error(r.msg);
  };
  if (screen === "deposit") {
    const accountNumber = method === "telebirr" ? pay.telebirr : pay.cbe;
    const copyAccount = async () => {
      try {
        await navigator.clipboard.writeText(accountNumber);
        toast.success("Account number copied");
      } catch {
        toast.error("Copy failed");
      }
    };
    const dMin = String(Math.floor(depTimer / 60)).padStart(2, "0");
    const dSec = String(depTimer % 60).padStart(2, "0");
    const Stepper = () => {
      const steps = [{
        n: 1,
        label: "Method"
      }, {
        n: 2,
        label: "Amount"
      }, {
        n: 3,
        label: "Confirm"
      }];
      return /* @__PURE__ */ jsx("div", { className: "flex items-center w-full px-1", children: steps.map((s, i) => {
        const done = depStep > s.n;
        const active = depStep === s.n;
        return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex items-center", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center min-w-[44px]", children: [
            /* @__PURE__ */ jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-colors ${done ? "bg-[#f5c518] border-[#f5c518] text-black" : active ? "bg-background border-[#f5c518] text-[#f5c518]" : "bg-background border-border text-muted-foreground"}`, children: done ? /* @__PURE__ */ jsx(Check, { size: 14 }) : s.n }),
            /* @__PURE__ */ jsx("div", { className: `mt-1 text-[10px] ${active || done ? "text-primary" : "text-muted-foreground"}`, children: s.label })
          ] }),
          i < steps.length - 1 && /* @__PURE__ */ jsx("div", { className: `flex-1 h-[2px] mx-1 mb-4 ${depStep > s.n ? "bg-[#f5c518]" : "bg-border"}` })
        ] }, s.n);
      }) });
    };
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => depStep === 1 ? setScreen("main") : setDepStep(depStep - 1), className: "text-xs text-primary", children: "← Back" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary", children: t("deposit") }),
        /* @__PURE__ */ jsx(Stepper, {}),
        depStep === 1 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Select payment method" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsx("button", { onClick: () => setMethod("telebirr"), className: `h-14 rounded-md overflow-hidden bg-white p-0 flex items-center justify-center ${method === "telebirr" ? "ring-2 ring-[#f5c518]" : "ring-1 ring-border"}`, children: /* @__PURE__ */ jsx("img", { src: telebirrLogo, alt: "Telebirr", className: "h-full w-full object-contain" }) }),
            /* @__PURE__ */ jsx("button", { onClick: () => setMethod("cbe"), className: `h-14 rounded-md overflow-hidden bg-white p-0 flex items-center justify-center ${method === "cbe" ? "ring-2 ring-[#f5c518]" : "ring-1 ring-border"}`, children: /* @__PURE__ */ jsx("img", { src: cbeLogo, alt: "CBE", className: "h-full w-full object-contain" }) })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => setDepStep(2), className: "w-full bg-[#f5c518] text-black font-bold py-2 rounded-md hover:brightness-95", children: "Next" })
        ] }),
        depStep === 2 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "bg-background border border-dashed border-primary/50 rounded-md p-3 flex flex-col items-center gap-1", children: [
            /* @__PURE__ */ jsx("img", { src: method === "telebirr" ? telebirrLogo : cbeLogo, alt: method, className: "h-8 w-auto object-contain" }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: t("sendTo") }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-primary tracking-wider", children: accountNumber }),
              /* @__PURE__ */ jsx("button", { onClick: copyAccount, className: "p-1.5 rounded bg-primary/10 hover:bg-primary/20 text-primary", "aria-label": "Copy", children: /* @__PURE__ */ jsx(Copy, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: method === "telebirr" ? "Telebirr" : "CBE" })
          ] }),
          /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground", children: [
            t("amount"),
            " (ETB)"
          ] }),
          /* @__PURE__ */ jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(Number(e.target.value) || 0), className: "w-full bg-background border rounded-md px-3 py-2" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [50, 100, 500, 1e3].map((v) => /* @__PURE__ */ jsx("button", { onClick: () => setAmount(v), className: "flex-1 text-xs bg-background border rounded py-1", children: v }, v)) }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            if (amount <= 0) return toast.error("Enter amount");
            setDepStep(3);
          }, className: "w-full bg-[#f5c518] text-black font-bold py-2 rounded-md hover:brightness-95", children: "Next" })
        ] }),
        depStep === 3 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Paste the SMS confirmation from ",
              method === "telebirr" ? "Telebirr" : "CBE"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: `text-xs font-mono font-bold px-2 py-0.5 rounded ${depTimer === 0 ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"}`, children: [
              dMin,
              ":",
              dSec
            ] })
          ] }),
          /* @__PURE__ */ jsx("textarea", { value: smsText, onChange: (e) => setSmsText(e.target.value), rows: 5, placeholder: "Paste the confirmation message sent to your phone…", className: "w-full bg-background border rounded-md px-3 py-2 text-sm resize-none" }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Progress, { value: (180 - depTimer) / 180 * 100, className: "h-2" }),
            /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground mt-1", children: depTimer > 0 ? `Please wait ${dMin}:${dSec} before submitting (gives the SMS time to arrive).` : "You can submit now." })
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: submitDeposit, disabled: depTimer > 0 || !smsText.trim(), className: "w-full bg-[#f5c518] text-black font-bold py-2 rounded-md disabled:opacity-50 hover:brightness-95", children: depTimer > 0 ? `Wait ${dMin}:${dSec}` : "Submit" })
        ] })
      ] })
    ] });
  }
  if (screen === "withdraw-method") {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setScreen("main"), className: "text-xs text-primary", children: "← Back" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary mb-3", children: "Select payment method" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2", children: ["telebirr", "cbe"].map((m) => /* @__PURE__ */ jsxs("button", { onClick: () => {
          setMethod(m);
          setScreen("withdraw-form");
        }, className: "w-full bg-secondary hover:bg-secondary/80 border rounded-md p-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsx(Wallet, { size: 18, className: "text-primary" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsx("div", { className: "font-bold", children: m === "telebirr" ? t("payTelebirr") : t("payCBE") }),
            /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
              "Withdraw to ",
              m === "telebirr" ? "Telebirr" : "CBE",
              " account"
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-primary", children: "→" })
        ] }, m)) })
      ] })
    ] });
  }
  if (screen === "withdraw-form") {
    const mm = String(Math.floor(timer / 60)).padStart(2, "0");
    const ss = String(timer % 60).padStart(2, "0");
    return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: () => setScreen("withdraw-method"), className: "text-xs text-primary", children: "← Back" }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary", children: [
            t("withdraw"),
            " · ",
            method === "telebirr" ? t("payTelebirr") : t("payCBE")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: `text-sm font-mono font-bold px-2 py-0.5 rounded ${timer < 30 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`, children: [
            mm,
            ":",
            ss
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-background border rounded-md p-2 text-center", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Withdrawable" }),
          /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-primary", children: [
            withdrawable.toFixed(2),
            " ETB"
          ] })
        ] }),
        (() => {
          const target = wagerRequired;
          const pct = Math.min(100, Math.round(wagered / target * 100));
          const remaining = Math.max(0, target - wagered);
          return /* @__PURE__ */ jsxs("div", { className: "bg-background border rounded-md p-3 space-y-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[11px]", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Wagering progress" }),
              /* @__PURE__ */ jsxs("span", { className: "font-bold text-primary", children: [
                pct,
                "%"
              ] })
            ] }),
            /* @__PURE__ */ jsx(Progress, { value: pct, className: "h-2" }),
            /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
              "Wagered ",
              wagered.toFixed(0),
              " / ",
              target.toFixed(0),
              " ETB",
              remaining > 0 ? ` · ${remaining.toFixed(0)} ETB more to unlock deposits & bonus` : " · Funds unlocked"
            ] })
          ] });
        })(),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground", children: method === "telebirr" ? "Telebirr account" : "CBE account" }),
          /* @__PURE__ */ jsx("input", { value: account, onChange: (e) => setAccount(e.target.value), className: "w-full bg-background border rounded-md px-3 py-2" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-xs text-muted-foreground", children: [
            t("amount"),
            " (ETB)"
          ] }),
          /* @__PURE__ */ jsx("input", { type: "number", value: amount, onChange: (e) => setAmount(Number(e.target.value) || 0), className: "w-full bg-background border rounded-md px-3 py-2" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [50, 100, 500, 1e3].map((v) => /* @__PURE__ */ jsx("button", { onClick: () => setAmount(v), className: "flex-1 text-xs bg-background border rounded py-1", children: v }, v)) }),
        /* @__PURE__ */ jsx("button", { onClick: submitWithdraw, disabled: timer === 0, className: "w-full bg-[#f5c518] text-black font-bold py-2 rounded-md disabled:opacity-50 hover:brightness-95", children: timer === 0 ? "Expired" : t("submit") })
      ] })
    ] });
  }
  const txDeposits = myTx.filter((x) => x.type === "deposit");
  const txWithdraws = myTx.filter((x) => x.type === "withdraw");
  const gameRows = rounds;
  const topups = myTx.filter((x) => x.type === "bonus");
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-card rounded-lg border p-4 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Balance for play" }),
      /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-primary", children: [
        playBalance.toFixed(2),
        " ETB"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground mt-1", children: [
        "Withdrawable: ",
        /* @__PURE__ */ jsxs("span", { className: "text-primary font-bold", children: [
          withdrawable.toFixed(2),
          " ETB"
        ] })
      ] }),
      bonusLock > 0 && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
        "Wager ",
        /* @__PURE__ */ jsxs("span", { className: "text-primary font-semibold", children: [
          bonusLock.toFixed(2),
          " ETB"
        ] }),
        " more to unlock deposits & bonus"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxs("button", { onClick: () => setScreen("deposit"), className: "bg-[#f5c518] text-black font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:brightness-95", children: [
        /* @__PURE__ */ jsx(Plus, { size: 16 }),
        " ",
        t("deposit")
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => setScreen("withdraw-method"), className: "bg-[#f5c518] text-black font-bold py-3 rounded-md flex items-center justify-center gap-2 hover:brightness-95", children: [
        /* @__PURE__ */ jsx(Minus, { size: 16 }),
        " ",
        t("withdraw")
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-primary", children: [
        /* @__PURE__ */ jsx(Receipt, { size: 16 }),
        " ",
        t("transactions")
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1 bg-background border rounded-md p-1 text-[11px]", children: ["deposit", "withdraw", "game", "topup"].map((k) => /* @__PURE__ */ jsx("button", { onClick: () => setTxTab(k), className: `py-1.5 rounded ${txTab === k ? "bg-[#f5c518] text-black font-bold" : "text-muted-foreground"}`, children: k === "deposit" ? t("deposit") : k === "withdraw" ? t("withdraw") : k === "game" ? t("game") : "Bonus" }, k)) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-h-72 overflow-y-auto", children: [
        txTab === "deposit" && (txDeposits.length === 0 ? /* @__PURE__ */ jsx(Empty, {}) : txDeposits.map((x) => /* @__PURE__ */ jsx(TxRow, { x, t }, x.id))),
        txTab === "withdraw" && (txWithdraws.length === 0 ? /* @__PURE__ */ jsx(Empty, {}) : txWithdraws.map((x) => /* @__PURE__ */ jsx(TxRow, { x, t }, x.id))),
        txTab === "game" && (gameRows.length === 0 ? /* @__PURE__ */ jsx(Empty, {}) : gameRows.slice(0, 50).map((r) => /* @__PURE__ */ jsxs("div", { className: "bg-secondary/30 rounded-md p-2 flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground text-xs", children: new Date(r.at).toLocaleString() }),
          /* @__PURE__ */ jsxs("span", { className: r.payout > 0 ? "text-primary font-bold" : "text-muted-foreground", children: [
            r.payout > 0 ? `+${r.payout}` : `-${r.bet}`,
            " ETB"
          ] })
        ] }, r.id))),
        txTab === "topup" && (topups.length === 0 ? /* @__PURE__ */ jsx(Empty, {}) : topups.map((x) => /* @__PURE__ */ jsx(TxRow, { x, t }, x.id)))
      ] })
    ] }),
    redeemOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4", onClick: () => setRedeemOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-4 w-full max-w-sm space-y-3", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-bold text-primary", children: [
          /* @__PURE__ */ jsx(Gift, { size: 18 }),
          " ",
          t("redeem"),
          " ",
          t("code")
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setRedeemOpen(false), className: "text-muted-foreground", children: /* @__PURE__ */ jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: t("enterCode"), className: "w-full bg-background border rounded-md px-3 py-2 text-sm tracking-wider font-bold" }),
      /* @__PURE__ */ jsx("button", { onClick: redeem, className: "w-full bg-primary text-primary-foreground font-bold py-2 rounded-md", children: t("submit") })
    ] }) })
  ] });
}
function Empty() {
  return /* @__PURE__ */ jsx("div", { className: "text-center text-muted-foreground text-xs py-4", children: "—" });
}
function TxRow({
  x,
  t
}) {
  const subLabel = x.type === "bonus" ? x.subtype === "signup" ? "Registration bonus" : x.subtype === "referral" ? "Invitation bonus" : x.subtype === "referral_deposit" ? "Invite deposit bonus" : x.subtype === "coupon" ? "Coupon code" : "Bonus" : null;
  return /* @__PURE__ */ jsxs("div", { className: "bg-secondary/30 rounded-md p-2 flex justify-between text-sm", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
        x.type === "withdraw" ? "-" : "+",
        " ",
        x.amount,
        " ETB"
      ] }),
      subLabel && /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-primary font-semibold", children: [
        subLabel,
        x.note ? ` · ${x.note}` : ""
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: new Date(x.createdAt).toLocaleString() })
    ] }),
    /* @__PURE__ */ jsx("span", { className: x.status === "approved" ? "text-primary text-xs" : x.status === "rejected" ? "text-destructive text-xs" : "text-yellow-500 text-xs", children: x.status === "approved" ? t("approved") : x.status === "rejected" ? t("rejected") : t("pending") })
  ] });
}
function AdminView({
  t,
  onChange,
  user
}) {
  const [tx, setTxState] = useState([]);
  const [forced, setForced] = useState(getForcedDraw().join(","));
  const [players, setPlayers] = useState([]);
  const [pay, setPay] = useState(getPayInfo());
  const [adminTab, setAdminTab] = useState("pending");
  const [activePatId, setActivePatId] = useState("single_line");
  const [activePatIds, setActivePatIdsState] = useState([]);
  const [rotate, setRotateState] = useState(false);
  const [forceWinner, setForceWinnerState] = useState("");
  useEffect(() => {
    setActivePatId(getActivePattern());
    setActivePatIdsState(getActivePatternIds());
    setRotateState(getPatternRotate());
    setForceWinnerState(getForceWinner());
  }, []);
  const [coupons, setCoupons] = useState([]);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    amount: 20,
    maxUses: 100,
    days: 7
  });
  const [callSpeed, setCallSpeedState] = useState(1e3);
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    setCallSpeedState(getCallSpeed());
    setActivities(getActivities());
  }, []);
  const reload = () => {
    setTxState(getTx());
    setForced(getForcedDraw().join(","));
    setPlayers(getUsers().filter((u) => !u.isAdmin));
    setCoupons(getCoupons());
    setActivities(getActivities());
  };
  useEffect(reload, []);
  const decide = (id, status) => {
    const all = getTx();
    const idx = all.findIndex((x) => x.id === id);
    if (idx === -1) return;
    const item = all[idx];
    let notifyChat;
    let newBalance;
    if (status === "approved") {
      const users = getUsers();
      const u = users.find((x) => x.username === item.username);
      if (u) {
        if (item.type === "deposit") {
          u.balance += item.amount;
          if (!u.firstDepositDone && item.amount >= REFERRAL_DEPOSIT_THRESHOLD && u.referredBy) {
            const inv = users.find((x) => x.username === u.referredBy);
            if (inv) {
              inv.balance += REFERRAL_DEPOSIT_BONUS;
              addTx({
                id: `b${Date.now()}rd`,
                username: inv.username,
                type: "bonus",
                subtype: "referral_deposit",
                amount: REFERRAL_DEPOSIT_BONUS,
                status: "approved",
                createdAt: Date.now(),
                note: `${u.username} first deposit`
              });
            }
            u.firstDepositDone = true;
          } else if (item.amount >= REFERRAL_DEPOSIT_THRESHOLD) {
            u.firstDepositDone = true;
          }
        } else {
          u.balance = Math.max(0, u.balance - item.amount);
        }
        saveUsers(users);
        notifyChat = u.telegramId;
        newBalance = u.balance;
      }
    } else {
      const u = getUsers().find((x) => x.username === item.username);
      notifyChat = u?.telegramId;
      newBalance = u?.balance;
    }
    all[idx] = {
      ...item,
      status
    };
    saveTx(all);
    if (notifyChat) {
      const verb = item.type === "deposit" ? "Deposit" : "Withdrawal";
      const head = status === "approved" ? `✅ <b>${verb} approved</b>` : `❌ <b>${verb} rejected</b>`;
      notifyTelegram({
        text: `${head}
Amount: <b>${fmtEtb(item.amount)}</b>` + (newBalance !== void 0 ? `
💰 New balance: <b>${fmtEtb(newBalance)}</b>` : "")
      });
    }
    reload();
    onChange();
    toast.success(status === "approved" ? t("approved") : t("rejected"));
  };
  const saveForce = () => {
    const nums = forced.split(/[\s,]+/).map((x) => parseInt(x.trim(), 10)).filter((n) => n >= 1 && n <= 80);
    const uniq = Array.from(new Set(nums)).slice(0, 20);
    setForcedDraw(uniq);
    setForced(uniq.join(","));
    toast.success("Saved " + uniq.length + " numbers");
  };
  const clearForce = () => {
    clearForcedDraw();
    setForced("");
    toast.message("Cleared");
  };
  const savePay = () => {
    setPayInfo(pay);
    toast.success("Saved");
  };
  const pending = tx.filter((x) => x.status === "pending");
  const done = tx.filter((x) => x.status !== "pending");
  const previewNums = forced.split(/[\s,]+/).map((x) => parseInt(x.trim(), 10)).filter((n) => n >= 1 && n <= 75);
  const seed = (user.seq ?? 1) * 47;
  const previewPlayers = useMemo(() => fakePlayers(), [seed]);
  const activePatternId = getActivePattern();
  const activePattern = patternById(activePatternId);
  const winners = previewNums.length > 0 ? previewPlayers.map((p) => {
    const d = /* @__PURE__ */ new Set([12]);
    const callSet = new Set(previewNums);
    p.cartella.forEach((n, i) => {
      if (i !== 12 && callSet.has(n)) d.add(i);
    });
    const hits = p.cartella.filter((n) => n > 0 && previewNums.includes(n)).length;
    return {
      ...p,
      hits,
      won: checkWin(activePattern, d)
    };
  }).filter((p) => p.won) : [];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 gap-1 bg-card border rounded-md p-1 text-[10px]", children: ["pending", "transactions", "players", "live", "coupons", "patterns", "activity", "settings"].map((k) => /* @__PURE__ */ jsx("button", { onClick: () => setAdminTab(k), className: `py-1.5 rounded ${adminTab === k ? "bg-[#f5c518] text-black font-bold" : "text-muted-foreground"}`, children: k === "pending" ? t("pending") : k === "transactions" ? t("transactions") : k === "players" ? t("players") : k === "live" ? t("livePlayers") : k === "coupons" ? t("coupons") : k === "patterns" ? "Patterns" : k === "activity" ? "Activity" : t("settings") }, k)) }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("totalProfit") }),
        /* @__PURE__ */ jsx("div", { className: "text-primary font-bold", children: getProfit().toFixed(0) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("players") }),
        /* @__PURE__ */ jsx("div", { className: "text-primary font-bold", children: players.length })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: t("transactions") }),
        /* @__PURE__ */ jsx("div", { className: "text-primary font-bold", children: tx.length })
      ] })
    ] }),
    adminTab === "transactions" && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2 space-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[40px_1fr_60px_70px_70px] gap-1 text-[10px] text-muted-foreground px-1", children: [
        /* @__PURE__ */ jsx("span", { children: "ID" }),
        /* @__PURE__ */ jsx("span", { children: t("username") }),
        /* @__PURE__ */ jsx("span", { children: t("type") }),
        /* @__PURE__ */ jsx("span", { children: t("amount") }),
        /* @__PURE__ */ jsx("span", { children: t("status") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-h-80 overflow-y-auto", children: [
        tx.map((x, i) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[40px_1fr_60px_70px_70px] gap-1 text-[11px] bg-secondary/30 rounded px-2 py-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: i + 1 }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: x.username }),
            x.phone ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("br", {}),
              /* @__PURE__ */ jsx("span", { className: "text-[9px] text-muted-foreground", children: x.phone })
            ] }) : null
          ] }),
          /* @__PURE__ */ jsx("span", { children: x.type }),
          /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: x.amount }),
          /* @__PURE__ */ jsx("span", { className: x.status === "approved" ? "text-primary" : x.status === "rejected" ? "text-destructive" : "text-yellow-500", children: x.status })
        ] }, x.id)),
        tx.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-xs text-muted-foreground py-2", children: "—" })
      ] })
    ] }),
    adminTab === "live" && /* @__PURE__ */ jsx(AdminLivePlayers, { t }),
    adminTab === "coupons" && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary", children: [
        t("create"),
        " ",
        t("coupons")
      ] }),
      /* @__PURE__ */ jsx("input", { value: newCoupon.code, onChange: (e) => setNewCoupon({
        ...newCoupon,
        code: e.target.value.toUpperCase()
      }), placeholder: t("code"), className: "w-full bg-background border rounded px-2 py-1.5 text-sm tracking-wider font-bold" }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-muted-foreground", children: t("amount") }),
          /* @__PURE__ */ jsx("input", { type: "number", value: newCoupon.amount, onChange: (e) => setNewCoupon({
            ...newCoupon,
            amount: Number(e.target.value) || 0
          }), className: "w-full bg-background border rounded px-2 py-1.5 text-sm" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { className: "text-[10px] text-muted-foreground", children: t("maxUses") }),
          /* @__PURE__ */ jsx("input", { type: "number", value: newCoupon.maxUses, onChange: (e) => setNewCoupon({
            ...newCoupon,
            maxUses: Number(e.target.value) || 1
          }), className: "w-full bg-background border rounded px-2 py-1.5 text-sm" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { className: "text-[10px] text-muted-foreground", children: [
            t("expires"),
            " (d)"
          ] }),
          /* @__PURE__ */ jsx("input", { type: "number", value: newCoupon.days, onChange: (e) => setNewCoupon({
            ...newCoupon,
            days: Number(e.target.value) || 1
          }), className: "w-full bg-background border rounded px-2 py-1.5 text-sm" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: () => {
        if (!newCoupon.code.trim()) return toast.error("Code required");
        addCoupon({
          code: newCoupon.code.trim().toUpperCase(),
          amount: newCoupon.amount,
          maxUses: newCoupon.maxUses,
          expiresAt: Date.now() + newCoupon.days * 864e5,
          usedBy: [],
          createdAt: Date.now()
        });
        setNewCoupon({
          code: "",
          amount: 20,
          maxUses: 100,
          days: 7
        });
        reload();
        toast.success("Created");
      }, className: "w-full bg-primary text-primary-foreground font-bold py-1.5 rounded text-sm", children: t("create") }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-h-60 overflow-y-auto pt-2 border-t", children: [
        coupons.map((c) => /* @__PURE__ */ jsxs("div", { className: "bg-secondary/30 rounded p-2 text-xs", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold tracking-wider text-primary", children: c.code }),
            /* @__PURE__ */ jsxs("span", { children: [
              c.amount,
              " ETB"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground flex justify-between mt-0.5", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              t("used"),
              ": ",
              c.usedBy.length,
              "/",
              c.maxUses
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              t("expires"),
              ": ",
              new Date(c.expiresAt).toLocaleDateString()
            ] })
          ] })
        ] }, c.code)),
        coupons.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-xs text-muted-foreground py-2", children: "—" })
      ] })
    ] }),
    adminTab === "patterns" && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary", children: "Active Bingo Patterns" }),
      /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Tap patterns to add/remove them from the active set. Players win by completing any selected pattern. Each pattern already accepts every valid position (rotations/translations). Changes apply on the next game." }),
      /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-between bg-secondary/30 rounded-md px-3 py-2 text-xs", children: [
        /* @__PURE__ */ jsx("span", { className: "font-semibold", children: "Auto-rotate patterns each game" }),
        /* @__PURE__ */ jsx("input", { type: "checkbox", checked: rotate, onChange: (e) => {
          setRotateState(e.target.checked);
          setPatternRotate(e.target.checked);
          toast.success(e.target.checked ? "Auto-rotate ON" : "Auto-rotate OFF");
        }, className: "accent-primary w-4 h-4" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
        "Selected: ",
        /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: activePatIds.length }),
        activePatIds.length > 0 && /* @__PURE__ */ jsx("button", { onClick: () => {
          setActivePatternIds([]);
          setActivePatIdsState([]);
          toast.message("Cleared");
        }, className: "ml-2 underline", children: "Clear" })
      ] }),
      ["lines", "letters", "blocks", "fun"].map((cat) => /* @__PURE__ */ jsxs("section", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground mb-1", children: cat === "lines" ? "Lines & Basics" : cat === "letters" ? "Letter Shapes" : cat === "blocks" ? "Number / Block" : "Fun & Specialty" }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-2", children: PATTERNS.filter((p) => p.category === cat).map((p) => {
          const m = previewMask(p);
          const inSet = activePatIds.includes(p.id);
          const positions = p.masks.length;
          return /* @__PURE__ */ jsxs("button", { onClick: () => {
            const next = inSet ? activePatIds.filter((x) => x !== p.id) : [...activePatIds, p.id];
            setActivePatIdsState(next);
            setActivePatternIds(next);
            if (next.length > 0) {
              setActivePattern(next[0]);
              setActivePatId(next[0]);
            }
            toast.success(inSet ? `Removed: ${p.label}` : `Added: ${p.label}`);
          }, className: `border rounded-md p-1.5 text-left ${inSet ? "border-primary bg-primary/10" : "border-border"}`, children: [
            /* @__PURE__ */ jsx("div", { className: "grid grid-cols-5 gap-[2px]", children: m.map((v, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square rounded-sm", style: {
              background: i === 12 ? "var(--primary)" : v ? "var(--primary)" : "var(--secondary)",
              opacity: v || i === 12 ? 1 : 0.4
            } }, i)) }),
            /* @__PURE__ */ jsx("div", { className: "text-[10px] font-semibold mt-1 leading-tight", children: p.label }),
            /* @__PURE__ */ jsxs("div", { className: "text-[9px] text-muted-foreground", children: [
              positions,
              " position",
              positions !== 1 ? "s" : ""
            ] })
          ] }, p.id);
        }) })
      ] }, cat))
    ] }),
    adminTab === "settings" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Gauge, { size: 14 }),
          " Calling Controls"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            raisePauseSignal();
            toast.message("Paused");
          }, className: "bg-amber-500 text-black font-bold py-2 rounded-md flex items-center justify-center gap-2 hover:brightness-110", children: [
            /* @__PURE__ */ jsx(Square, { size: 14 }),
            " Pause"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            raiseResumeSignal();
            toast.success("Continued");
          }, className: "bg-emerald-500 text-black font-bold py-2 rounded-md flex items-center justify-center gap-2 hover:brightness-110", children: [
            /* @__PURE__ */ jsx(Play, { size: 14 }),
            " Continue"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            raiseRestartSignal();
            toast.message("Restart signal sent");
          }, className: "bg-sky-500 text-black font-bold py-2 rounded-md flex items-center justify-center gap-2 hover:brightness-110", children: [
            /* @__PURE__ */ jsx(History, { size: 14 }),
            " Restart"
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => {
            raiseStopSignal();
            toast.success("Stop signal sent");
          }, className: "bg-destructive text-destructive-foreground font-bold py-2 rounded-md flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsx(Square, { size: 14 }),
            " Stop"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Calling speed (delay between balls)" }),
            /* @__PURE__ */ jsxs("span", { className: "text-primary font-bold", children: [
              (callSpeed / 1e3).toFixed(1),
              "s"
            ] })
          ] }),
          /* @__PURE__ */ jsx("input", { type: "range", min: SPEED_MIN, max: SPEED_MAX, step: 100, value: callSpeed, onChange: (e) => {
            const v = Number(e.target.value);
            setCallSpeedState(v);
            setCallSpeed(v);
          }, className: "w-full accent-primary" }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[10px] text-muted-foreground", children: [
            /* @__PURE__ */ jsx("span", { children: "Fast" }),
            /* @__PURE__ */ jsx("span", { children: "Slow" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary", children: t("paySettings") }),
        /* @__PURE__ */ jsx("label", { className: "text-[11px] text-muted-foreground", children: "Telebirr" }),
        /* @__PURE__ */ jsx("input", { value: pay.telebirr, onChange: (e) => setPay({
          ...pay,
          telebirr: e.target.value
        }), className: "w-full bg-background border rounded-md px-2 py-1.5 text-sm" }),
        /* @__PURE__ */ jsx("label", { className: "text-[11px] text-muted-foreground", children: "CBE" }),
        /* @__PURE__ */ jsx("input", { value: pay.cbe, onChange: (e) => setPay({
          ...pay,
          cbe: e.target.value
        }), className: "w-full bg-background border rounded-md px-2 py-1.5 text-sm" }),
        /* @__PURE__ */ jsx("button", { onClick: savePay, className: "w-full bg-primary text-primary-foreground font-bold py-1.5 rounded-md text-sm", children: t("save") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary", children: t("forceDraw") }),
        /* @__PURE__ */ jsx("input", { value: forced, onChange: (e) => setForced(e.target.value), placeholder: t("forceHint"), className: "w-full bg-background border rounded-md px-2 py-1.5 text-sm" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: saveForce, className: "bg-primary text-primary-foreground font-bold py-1.5 rounded-md text-sm", children: t("forceSet") }),
          /* @__PURE__ */ jsx("button", { onClick: clearForce, className: "bg-destructive text-destructive-foreground font-bold py-1.5 rounded-md text-sm", children: t("forceClear") })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground pt-1", children: t("nextWinners") }),
        winners.length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: t("noWinners") }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: winners.map((w, i) => /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs bg-secondary/40 rounded px-2 py-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: w.name }),
          /* @__PURE__ */ jsxs("span", { children: [
            w.hits,
            " hits · BINGO"
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-bold text-primary", children: "Force Winner (by Player ID)" }),
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Enter a player's profile ID, username, or sequence number. The next game will be biased so that player wins. Cleared automatically after the round." }),
        /* @__PURE__ */ jsx("input", { value: forceWinner, onChange: (e) => setForceWinnerState(e.target.value), placeholder: "e.g. 1000137 or playerUsername", className: "w-full bg-background border rounded-md px-2 py-1.5 text-sm" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsx("button", { onClick: () => {
            setForceWinner(forceWinner.trim());
            toast.success(forceWinner.trim() ? `Forced winner: ${forceWinner.trim()}` : "Cleared");
          }, className: "bg-primary text-primary-foreground font-bold py-1.5 rounded-md text-sm", children: "Set" }),
          /* @__PURE__ */ jsx("button", { onClick: () => {
            clearForceWinner();
            setForceWinnerState("");
            toast.message("Cleared");
          }, className: "bg-destructive text-destructive-foreground font-bold py-1.5 rounded-md text-sm", children: "Clear" })
        ] }),
        getForceWinner() && /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-primary pt-1", children: [
          "Active: ",
          /* @__PURE__ */ jsx("b", { children: getForceWinner() })
        ] })
      ] })
    ] }),
    adminTab === "players" && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary", children: [
        t("players"),
        " (",
        players.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[40px_1fr_auto_auto] gap-1 text-[10px] text-muted-foreground px-1", children: [
        /* @__PURE__ */ jsx("span", { children: "ID" }),
        /* @__PURE__ */ jsxs("span", { children: [
          t("username"),
          " / ",
          t("phone")
        ] }),
        /* @__PURE__ */ jsx("span", { children: t("balance") }),
        /* @__PURE__ */ jsx("span", { children: t("games") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-h-56 overflow-y-auto", children: [
        players.map((p) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[40px_1fr_auto_auto] gap-1 text-xs bg-secondary/30 rounded px-2 py-1.5 items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: p.seq ?? "-" }),
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold", children: p.username }),
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground", children: p.phone || "—" })
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: p.balance.toFixed(0) }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: p.games ?? 0 })
        ] }, p.username)),
        players.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-xs text-muted-foreground py-2", children: "—" })
      ] })
    ] }),
    adminTab === "activity" && /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary", children: [
        "User Activity (",
        activities.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "max-h-96 overflow-y-auto space-y-1", children: [
        activities.map((a) => /* @__PURE__ */ jsxs("div", { className: "text-[11px] bg-secondary/30 rounded px-2 py-1.5 flex justify-between gap-2", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("b", { className: "text-primary", children: a.username }),
            " · ",
            a.type,
            a.detail ? ` · ${a.detail}` : ""
          ] }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground shrink-0", children: new Date(a.at).toLocaleString() })
        ] }, a.id)),
        activities.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-xs text-muted-foreground py-4", children: "—" })
      ] })
    ] }),
    adminTab === "pending" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground px-1", children: t("pending") }),
      pending.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-muted-foreground text-sm py-4", children: t("nothingPending") }),
      pending.map((x) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold", children: x.username }),
          /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: x.type === "deposit" ? `${t("deposit")} · ${x.method ?? ""}` : t("withdraw") })
        ] }),
        x.phone && /* @__PURE__ */ jsxs("div", { className: "text-xs text-primary flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(Phone, { size: 12 }),
          " ",
          x.phone
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-primary", children: [
          x.amount,
          " ETB"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs("button", { onClick: () => decide(x.id, "approved"), className: "bg-primary text-primary-foreground font-bold py-2 rounded-md flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsx(Check, { size: 16 }),
            " ",
            t("approve")
          ] }),
          /* @__PURE__ */ jsxs("button", { onClick: () => decide(x.id, "rejected"), className: "bg-destructive text-destructive-foreground font-bold py-2 rounded-md flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsx(X, { size: 16 }),
            " ",
            t("reject")
          ] })
        ] })
      ] }, x.id)),
      done.length > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground px-1 pt-2", children: t("history") }),
        done.slice(0, 30).map((x) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2 flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            x.username,
            " · ",
            x.type,
            " · ",
            x.amount,
            x.phone ? ` · ${x.phone}` : ""
          ] }),
          /* @__PURE__ */ jsx("span", { className: x.status === "approved" ? "text-primary" : "text-destructive", children: x.status })
        ] }, x.id))
      ] })
    ] })
  ] });
}
function AdminLivePlayers({
  t
}) {
  const live = useLivePlayers();
  const sorted = useMemo(() => [...live].sort((a, b) => b.at - a.at), [live]);
  const byStake = useMemo(() => {
    const m = /* @__PURE__ */ new Map();
    sorted.forEach((p) => {
      if (!p.joined) return;
      m.set(p.stake, (m.get(p.stake) ?? 0) + 1);
    });
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [sorted]);
  return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2 space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm font-bold text-primary flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }),
        t("livePlayers"),
        " (",
        sorted.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-[10px] text-muted-foreground", children: "live · updates every 1s" })
    ] }),
    byStake.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: byStake.map(([stake, count]) => /* @__PURE__ */ jsxs("span", { className: "text-[10px] bg-secondary/40 border border-border rounded px-2 py-0.5", children: [
      "ብር ",
      stake,
      ": ",
      /* @__PURE__ */ jsx("span", { className: "text-primary font-bold", children: count })
    ] }, stake)) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1 max-h-72 overflow-y-auto", children: [
      sorted.map((p) => {
        const age = Math.max(0, Math.floor((Date.now() - p.at) / 1e3));
        return /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[1fr_auto_auto_auto] gap-2 text-[11px] bg-secondary/30 rounded px-2 py-1.5 items-center", children: [
          /* @__PURE__ */ jsx("span", { className: "font-bold truncate", children: p.username }),
          /* @__PURE__ */ jsxs("span", { className: `tabular-nums font-semibold ${p.joined ? "text-primary" : "text-muted-foreground"}`, children: [
            "ብር ",
            p.stake,
            /* @__PURE__ */ jsx("span", { className: "ml-1 text-[9px] font-normal uppercase tracking-wide opacity-70", children: p.joined ? "in" : "lobby" })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground tabular-nums", children: [
            "G#",
            p.gameNo
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-[9px] text-muted-foreground text-right tabular-nums w-8", children: [
            age,
            "s"
          ] })
        ] }, p.username);
      }),
      sorted.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-xs text-muted-foreground py-4", children: "No live players yet" })
    ] })
  ] });
}
function HistoryView({
  user,
  t
}) {
  const rounds = useMemo(() => getHistory().filter((r) => r.username === user.username), [user.username]);
  if (rounds.length === 0) return /* @__PURE__ */ jsx("div", { className: "text-center text-muted-foreground text-sm py-6", children: "—" });
  return /* @__PURE__ */ jsx("div", { className: "space-y-2", children: rounds.map((r) => /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-3 space-y-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-xs", children: [
      /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: new Date(r.at).toLocaleString() }),
      /* @__PURE__ */ jsxs("span", { className: r.payout > 0 ? "text-primary font-bold" : "text-muted-foreground", children: [
        r.payout > 0 ? `+${r.payout}` : `-${r.bet}`,
        " ETB"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1", children: r.picks.map((n) => /* @__PURE__ */ jsx("span", { className: `w-6 h-6 text-[10px] flex items-center justify-center rounded ${r.drawn.includes(n) ? "bg-primary text-primary-foreground" : "bg-secondary"}`, children: n }, n)) }),
    /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
      "Hits: ",
      r.hits,
      "/",
      r.picks.length,
      " · Bet ",
      r.bet
    ] })
  ] }, r.id)) });
}
function HomeView({
  t,
  onPlay,
  onWallet,
  onNavigate,
  user,
  onChange
}) {
  const [code, setCode] = useState("");
  user.telegramId;
  useEffect(() => {
    try {
      const c = sessionStorage.getItem("fk_tg_code");
      if (c) {
        setCode(c);
        sessionStorage.removeItem("fk_tg_code");
      }
    } catch {
    }
  }, []);
  const redeem = () => {
    if (!code.trim()) return;
    const r = redeemCoupon(code, user.username);
    if (r.ok) {
      toast.success(r.msg);
      const fresh = getCurrentUser();
      notifyTelegram({
        text: `🎟️ <b>Coupon redeemed!</b>
Code: <code>${code.toUpperCase()}</code>
Added: <b>+${r.amount} ETB</b>
💰 New balance: <b>${fmtEtb(fresh?.balance ?? user.balance)}</b>`
      });
      setCode("");
      onChange();
    } else toast.error(r.msg);
  };
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);
  const install = async () => {
    if (deferred) {
      deferred.prompt();
      const {
        outcome
      } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    if (isIOS) {
      toast.message("Tap the Share button in Safari, then 'Add to Home Screen' to install.");
    } else if (isAndroid) {
      toast.message("Tap the menu (⋮) in Chrome, then 'Install app' to download.");
    } else {
      toast.message("Click the install icon in your browser's address bar to download the app.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 py-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-5 text-center", children: [
      /* @__PURE__ */ jsx("img", { src: logo, alt: "Fast Keno", className: "h-16 w-auto mx-auto mb-3" }),
      /* @__PURE__ */ jsx("div", { className: "text-lg font-bold text-primary", children: t("appName") }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground mt-1", children: t("welcome") })
    ] }),
    /* @__PURE__ */ jsxs("button", { onClick: install, disabled: installed, className: "play-btn w-full py-3.5 rounded-md font-bold text-base flex items-center justify-center gap-2 disabled:opacity-70", children: [
      /* @__PURE__ */ jsx(Download, { size: 18 }),
      " ",
      installed ? t("installed") : t("install")
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-3 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-primary", children: [
        /* @__PURE__ */ jsx(Gift, { size: 16 }),
        " ",
        t("redeem")
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: t("enterCode"), className: "flex-1 bg-background border rounded-md px-3 py-2 text-sm tracking-wider font-bold" }),
        /* @__PURE__ */ jsx("button", { onClick: redeem, className: "bg-primary text-primary-foreground font-bold px-4 rounded-md text-sm", children: t("submit") })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
      /* @__PURE__ */ jsxs("button", { onClick: onPlay, className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx("span", { className: "text-2xl", children: "🏆" }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: t("play") })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => onNavigate("me"), className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx(User, { className: "text-primary", size: 22 }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: t("profile") })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: onWallet, className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx(Wallet, { className: "text-primary", size: 22 }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: t("balance") })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: onWallet, className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx(Plus, { className: "text-primary", size: 22 }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: t("deposit") })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: onWallet, className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx(Minus, { className: "text-primary", size: 22 }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: t("withdraw") })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => onNavigate("invite"), className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx(Share2, { className: "text-primary", size: 22 }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: t("invite") })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => onNavigate("help"), className: "bg-card border-2 border-primary/40 rounded-lg p-4 flex items-center gap-3 text-left col-span-2 hover:bg-primary/10 transition", children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "text-primary", size: 22 }),
        /* @__PURE__ */ jsx("div", { className: "font-bold", children: "Help" })
      ] })
    ] })
  ] });
}
function HelpView({
  t: _t
}) {
  return /* @__PURE__ */ jsx("div", { className: "space-y-3 py-2", children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-4 space-y-2", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-lg font-bold text-primary", children: "Help & Support" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Welcome to Adey Bingo. Here's how to play and manage your account:" }),
    /* @__PURE__ */ jsxs("ul", { className: "text-sm space-y-2 list-disc pl-5", children: [
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("b", { children: "Start a game:" }),
        " Tap 🏆 at the bottom, pick a cartella number (1–75), set your bet, and press Play."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("b", { children: "Deposit:" }),
        " Open Balance, choose Telebirr or CBE, send the amount, and submit your transaction reference. Admin approves it."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("b", { children: "Withdraw:" }),
        " Open Balance, enter the amount and your phone, and submit. Admin processes the payout."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("b", { children: "Redeem coupon:" }),
        " On Home, paste the code in the Redeem box."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("b", { children: "Invite friends:" }),
        " Share your referral link from the Invite page to earn bonuses."
      ] }),
      /* @__PURE__ */ jsxs("li", { children: [
        /* @__PURE__ */ jsx("b", { children: "Telegram:" }),
        " Use the bot for quick deposit, withdraw, balance, and game updates."
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground pt-2", children: "Need more help? Tap the chat icon in the header." })
  ] }) });
}
function ResultsView({
  t
}) {
  const rounds = useMemo(() => getHistory().slice(0, 50), []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: t("drawId") }),
      /* @__PURE__ */ jsx("span", { children: t("combination") })
    ] }),
    rounds.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-muted-foreground text-sm py-6", children: "—" }),
    rounds.map((r, idx) => {
      const id = 254700 + idx;
      const time = new Date(r.at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      return /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-md p-2 flex gap-2 items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "shrink-0 w-20", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-primary font-bold text-sm flex items-center gap-1", children: [
            /* @__PURE__ */ jsx("span", { className: "w-3.5 h-3.5 rounded-full bg-primary/80 flex items-center justify-center", children: /* @__PURE__ */ jsx(Check, { size: 9, className: "text-primary-foreground", strokeWidth: 4 }) }),
            id
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-[11px] text-primary/80", children: time })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-10 gap-0.5 flex-1", children: r.drawn.map((n, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square bg-secondary rounded text-[10px] flex items-center justify-center text-foreground", children: n }, i)) })
      ] }, r.id);
    })
  ] });
}
function StatsView({
  t
}) {
  const counts = useMemo(() => {
    const rounds = getHistory().slice(0, 100);
    const c = new Array(81).fill(0);
    for (const r of rounds) for (const n of r.drawn) if (n >= 1 && n <= 80) c[n]++;
    return c;
  }, []);
  const max = Math.max(1, ...counts.slice(1));
  const totalRounds = useMemo(() => getHistory().slice(0, 100).length, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-1 text-xs", children: [
      /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
        t("last100"),
        " · ",
        totalRounds,
        " ",
        totalRounds === 1 ? "round" : "rounds"
      ] }),
      /* @__PURE__ */ jsx("span", { className: "text-primary", children: t("sort") })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-1.5", children: Array.from({
      length: 80
    }, (_, i) => i + 1).map((n) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 bg-card border rounded-md px-2 py-1.5", children: [
      /* @__PURE__ */ jsx("div", { className: "w-8 h-7 bg-secondary rounded text-xs font-bold flex items-center justify-center", children: n }),
      /* @__PURE__ */ jsx("div", { className: "flex-1 h-0.5 bg-secondary/50 relative", children: /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 left-0 bg-primary", style: {
        width: `${counts[n] / max * 100}%`
      } }) }),
      /* @__PURE__ */ jsx("div", { className: "w-8 text-right text-sm text-muted-foreground", children: counts[n] })
    ] }, n)) })
  ] });
}
function LeadersView({
  t
}) {
  const rows = useMemo(() => {
    const history = getHistory();
    const agg = /* @__PURE__ */ new Map();
    for (const h of history) {
      const cur = agg.get(h.username) ?? {
        name: h.username,
        games: 0,
        wins: 0
      };
      cur.games += 1;
      cur.wins += h.payout ?? 0;
      agg.set(h.username, cur);
    }
    return Array.from(agg.values()).sort((a, b) => b.wins - a.wins).slice(0, 20);
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-[40px_1fr_80px_90px] gap-2 px-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsx("span", { children: t("rank") }),
      /* @__PURE__ */ jsx("span", { children: t("id") }),
      /* @__PURE__ */ jsx("span", { className: "text-center", children: t("games") }),
      /* @__PURE__ */ jsx("span", { className: "text-right", children: t("win") })
    ] }),
    rows.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-center text-muted-foreground text-sm py-6", children: "—" }),
    rows.map((r, i) => {
      const top = i < 3;
      return /* @__PURE__ */ jsxs("div", { className: `grid grid-cols-[40px_1fr_80px_90px] gap-2 items-center rounded-md border p-2 ${top ? "bg-primary/10 border-primary/30" : "bg-card"}`, children: [
        /* @__PURE__ */ jsx("span", { className: `font-bold ${top ? "text-yellow-400" : "text-muted-foreground"}`, children: i + 1 }),
        /* @__PURE__ */ jsx("span", { className: "text-primary font-semibold", children: r.name }),
        /* @__PURE__ */ jsx("span", { className: "text-center", children: r.games }),
        /* @__PURE__ */ jsxs("span", { className: `text-right font-bold ${top ? "text-yellow-400" : "text-primary"}`, children: [
          r.wins.toFixed(0),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] ml-0.5", children: "ETB" })
        ] })
      ] }, i);
    })
  ] });
}
function MeView({
  user,
  t,
  onNavigate,
  onLogout
}) {
  const wagered = useMemo(() => getHistory().filter((h) => h.username === user.username).reduce((s, h) => s + (h.bet ?? 0), 0), [user.username]);
  useMemo(() => getTx().filter((x) => x.username === user.username && x.type === "deposit" && x.status === "approved").reduce((s, x) => s + (x.amount ?? 0), 0), [user.username]);
  const wagerLock = Math.max(0, WAGER_REQUIREMENT - wagered);
  const withdrawable = Math.max(0, user.balance - wagerLock);
  const userId = ensureUserId6(user);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [code, setCode] = useState("");
  user.telegramId;
  const redeem = () => {
    if (!code.trim()) return;
    const r = redeemCoupon(code, user.username);
    if (r.ok) {
      toast.success(r.msg);
      const fresh = getCurrentUser();
      addTx({
        id: `b${Date.now()}c`,
        username: user.username,
        type: "bonus",
        subtype: "coupon",
        amount: r.amount ?? 0,
        status: "approved",
        createdAt: Date.now(),
        note: `Code ${code.toUpperCase()}`
      });
      notifyTelegram({
        text: `🎟️ <b>Coupon redeemed!</b>
Code: <code>${code.toUpperCase()}</code>
Added: <b>+${r.amount} ETB</b>
New balance: <b>${fmtEtb(fresh?.balance ?? user.balance)}</b>`
      });
      setCode("");
      setRedeemOpen(false);
    } else toast.error(r.msg);
  };
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);
    if (window.matchMedia?.("(display-mode: standalone)").matches) setInstalled(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);
  const install = async () => {
    if (deferred) {
      deferred.prompt();
      const {
        outcome
      } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);
    if (isIOS) toast.message("Tap Share in Safari, then 'Add to Home Screen'.");
    else if (isAndroid) toast.message("Open Chrome menu (⋮) and tap 'Install app'.");
    else toast.message("Click the install icon in your browser's address bar.");
  };
  const Row = ({
    icon,
    label,
    onClick,
    danger
  }) => /* @__PURE__ */ jsxs("button", { onClick, className: `w-full flex items-center gap-3 bg-card border rounded-lg px-4 py-3 hover:bg-secondary/40 transition ${danger ? "border-destructive/40" : ""}`, children: [
    /* @__PURE__ */ jsx("span", { className: "w-10 h-10 flex items-center justify-center shrink-0 overflow-hidden", children: icon }),
    /* @__PURE__ */ jsx("span", { className: `flex-1 text-left font-semibold ${danger ? "text-destructive" : ""}`, children: label }),
    /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "›" })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("img", { src: avatarIcon.url, alt: "Avatar", className: "w-16 h-16 rounded-full object-cover shrink-0" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-base truncate", children: user.username }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground tabular-nums", children: maskPhone(user.phone) }),
        /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          "UID: ",
          /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold", children: userId })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsx("img", { src: walletIcon.url, alt: "Wallet", className: "w-12 h-12 shrink-0 object-contain" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "text-[11px] text-muted-foreground", children: "Wallet balance" }),
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-primary leading-tight", children: [
          user.balance.toFixed(2),
          " ",
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: "ETB" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
          "Withdrawable: ",
          /* @__PURE__ */ jsxs("span", { className: "text-primary font-semibold", children: [
            withdrawable.toFixed(2),
            " ETB"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Row, { icon: /* @__PURE__ */ jsx("img", { src: withdrawIcon.url, alt: "", className: "w-9 h-9 object-contain shrink-0" }), label: t("withdraw"), onClick: () => onNavigate("withdraw-method") }),
      /* @__PURE__ */ jsx(Row, { icon: /* @__PURE__ */ jsx("img", { src: depositIcon.url, alt: "", className: "w-9 h-9 object-contain shrink-0" }), label: t("deposit"), onClick: () => onNavigate("deposit") }),
      /* @__PURE__ */ jsx(Row, { icon: /* @__PURE__ */ jsx("img", { src: transactionsIcon.url, alt: "", className: "w-9 h-9 object-contain shrink-0" }), label: t("transactions"), onClick: () => onNavigate("transactions") }),
      /* @__PURE__ */ jsx(Row, { icon: /* @__PURE__ */ jsx("img", { src: couponIcon.url, alt: "", className: "w-9 h-9 object-contain shrink-0" }), label: `${t("redeem")} ${t("code")}`, onClick: () => setRedeemOpen(true) }),
      /* @__PURE__ */ jsx(Row, { icon: /* @__PURE__ */ jsx("img", { src: downloadIcon.url, alt: "", className: "w-9 h-9 object-contain shrink-0" }), label: installed ? t("installed") : t("install"), onClick: install }),
      /* @__PURE__ */ jsx(Row, { icon: /* @__PURE__ */ jsx("img", { src: logoutIcon.url, alt: "", className: "w-9 h-9 object-contain shrink-0" }), label: t("logout"), onClick: onLogout, danger: true })
    ] }),
    redeemOpen && /* @__PURE__ */ jsx("div", { className: "fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4", onClick: () => setRedeemOpen(false), children: /* @__PURE__ */ jsxs("div", { className: "bg-card border rounded-lg p-4 w-full max-w-sm space-y-3", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-bold text-primary", children: [
          /* @__PURE__ */ jsx(Gift, { size: 18 }),
          " ",
          t("redeem"),
          " ",
          t("code")
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => setRedeemOpen(false), className: "text-muted-foreground", children: /* @__PURE__ */ jsx(X, { size: 18 }) })
      ] }),
      /* @__PURE__ */ jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: t("enterCode"), className: "w-full bg-background border rounded-md px-3 py-2 text-sm tracking-wider font-bold" }),
      /* @__PURE__ */ jsx("button", { onClick: redeem, className: "w-full bg-primary text-primary-foreground font-bold py-2 rounded-md", children: t("submit") })
    ] }) })
  ] });
}
function InviteView({
  user,
  t
}) {
  const refCode = user.refCode || user.username;
  const profileId = ensureUserId6(user);
  const url2 = `https://t.me/${BOT_USERNAME}?start=${encodeURIComponent(refCode)}`;
  const msg = `${t("inviteMsg")} ${refCode}`;
  const share = () => {
    const tg = `https://t.me/share/url?url=${encodeURIComponent(url2)}&text=${encodeURIComponent(msg)}`;
    window.open(tg, "_blank");
  };
  const copy = () => {
    navigator.clipboard?.writeText(url2).then(() => toast.success("Copied"));
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3 pb-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative overflow-hidden rounded-2xl p-5 text-white shadow-xl", style: {
      background: "linear-gradient(135deg,#0b2a4a 0%,#0d4d8a 45%,#0088cc 100%)"
    }, children: [
      /* @__PURE__ */ jsx("div", { className: "absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" }),
      /* @__PURE__ */ jsx("div", { className: "absolute -left-6 -bottom-10 w-28 h-28 rounded-full bg-amber-400/20 blur-2xl" }),
      /* @__PURE__ */ jsxs("div", { className: "relative flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-3xl shadow-inner", children: "🎁" }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-[0.18em] text-amber-300 font-bold", children: "Referral Program" }),
          /* @__PURE__ */ jsx("div", { className: "font-black text-xl leading-tight", children: "Invite & Earn" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative mt-4 grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur rounded-lg px-3 py-2 border border-white/15", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/70", children: "On Signup" }),
          /* @__PURE__ */ jsxs("div", { className: "text-amber-300 font-extrabold text-lg leading-tight", children: [
            "+",
            REFERRAL_SIGNUP_BONUS,
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: "ETB" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "bg-white/10 backdrop-blur rounded-lg px-3 py-2 border border-white/15", children: [
          /* @__PURE__ */ jsx("div", { className: "text-[10px] text-white/70", children: "First Deposit" }),
          /* @__PURE__ */ jsxs("div", { className: "text-amber-300 font-extrabold text-lg leading-tight", children: [
            "+",
            REFERRAL_DEPOSIT_BONUS,
            " ",
            /* @__PURE__ */ jsx("span", { className: "text-xs", children: "ETB" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl p-4 text-center bg-gradient-to-br from-amber-500/15 to-amber-700/5 border border-amber-500/30", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-amber-400 font-bold", children: "Your Referral Code" }),
      /* @__PURE__ */ jsx("div", { className: "text-4xl font-black text-amber-300 tracking-[0.2em] mt-1 drop-shadow", children: refCode }),
      /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground mt-2", children: [
        "Player ID: ",
        /* @__PURE__ */ jsx("span", { className: "text-foreground font-semibold", children: profileId })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-3 space-y-3", children: [
      /* @__PURE__ */ jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-bold", children: "Your Invite Link" }),
      /* @__PURE__ */ jsx("div", { className: "bg-background border border-border rounded-lg px-3 py-2 text-[11px] break-all font-mono", children: url2 }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsx("button", { onClick: copy, className: "rounded-lg px-3 py-2.5 text-sm font-bold bg-secondary text-secondary-foreground border border-border hover:bg-secondary/80 transition", children: "📋 Copy Link" }),
        /* @__PURE__ */ jsxs("button", { onClick: share, className: "rounded-lg px-3 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 flex items-center justify-center gap-2", style: {
          background: "linear-gradient(135deg,#0088cc,#005f8a)"
        }, children: [
          /* @__PURE__ */ jsx("img", { src: telegramLogo, alt: "", className: "h-5 w-5" }),
          "Share on Telegram"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-bold mb-2", children: "How it works" }),
      /* @__PURE__ */ jsxs("ol", { className: "space-y-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0", children: "1" }),
          "Share your invite link with friends."
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0", children: "2" }),
          "They sign up — you instantly get +",
          REFERRAL_SIGNUP_BONUS,
          " ETB."
        ] }),
        /* @__PURE__ */ jsxs("li", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("span", { className: "w-5 h-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0", children: "3" }),
          "On their first deposit, earn another +",
          REFERRAL_DEPOSIT_BONUS,
          " ETB."
        ] })
      ] })
    ] })
  ] });
}
function BingoWinnerOverlay({
  winner,
  t
}) {
  const drawnSet = new Set(winner.drawn);
  return /* @__PURE__ */ jsxs("div", { className: "bingo-winner", children: [
    /* @__PURE__ */ jsx("div", { className: "grand-badge mb-4", children: t("grandWinner") }),
    /* @__PURE__ */ jsx("div", { className: "bingo-text mb-6", children: "BINGO!" }),
    /* @__PURE__ */ jsxs("div", { className: "winner-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-[10px] font-bold text-slate-500 px-1 mb-1", children: [
        /* @__PURE__ */ jsx("span", { children: t("winningTicket") }),
        /* @__PURE__ */ jsxs("span", { className: "text-amber-600", children: [
          "#",
          winner.ticketId
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "bingo-col-head", children: ["B", "I", "N", "G", "O"].map((L) => /* @__PURE__ */ jsx("div", { style: {
        background: BINGO_COL_BG[L]
      }, children: L }, L)) }),
      /* @__PURE__ */ jsx("div", { className: "bingo-grid", children: winner.cartella.map((n, i) => {
        const free = i === 12;
        const isHit = free || n > 0 && drawnSet.has(n);
        return /* @__PURE__ */ jsx("div", { className: `bingo-cell ${isHit ? "hit" : ""} ${free ? "free" : ""}`, children: free ? "★" : n || "" }, i);
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "text-center text-[10px] font-bold text-amber-700 mt-1", children: [
        "Pattern: ",
        winner.patternLabel
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "text-amber-500 text-xs tracking-widest mb-1", children: "አሸናፊው" }),
      /* @__PURE__ */ jsx("div", { className: "text-white text-3xl font-black tracking-wider drop-shadow", children: winner.name }),
      /* @__PURE__ */ jsxs("div", { className: "text-slate-400 text-xs mt-2 tracking-widest", children: [
        t("ticket"),
        " #",
        winner.ticketId,
        " · ",
        winner.bet,
        " ETB"
      ] })
    ] })
  ] });
}
export {
  App as component
};
