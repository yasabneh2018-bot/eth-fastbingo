import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import "react";
const appCss = "/assets/styles-DfMLcUSO.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$1 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#16a34a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Fast Bingo" },
      { title: "Fast Bingo" },
      { name: "description", content: "Fast Bingo is a 5x5 online bingo game with customizable winning patterns." },
      { name: "author", content: "Fast Bingo" },
      { property: "og:title", content: "Fast Bingo" },
      { property: "og:description", content: "Fast Bingo is a 5x5 online bingo game with customizable winning patterns." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@FastBingo" },
      { name: "twitter:title", content: "Fast Bingo" },
      { name: "twitter:description", content: "Fast Bingo is a 5x5 online bingo game with customizable winning patterns." },
      { property: "og:image", content: "/icon-512.png" },
      { name: "twitter:image", content: "/icon-512.png" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "icon", href: "/icon-192.png", type: "image/png" }
    ],
    scripts: [
      {
        children: "if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})});}"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$1.useRouteContext();
  if (typeof window !== "undefined") {
    void import("./realtime-yvHaME7H.js").then((n) => n._).then((m) => m.initRealtime());
  }
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(Outlet, {}) });
}
const G = (s) => s.replace(/\s+/g, "").split("").map((c) => c === "1" ? 1 : 0);
const ROW = (r) => G(
  [0, 1, 2, 3, 4].map((rr) => "11111".split("").map(() => rr === r ? "1" : "0").join("")).join("")
);
const COL = (c) => G(
  Array(5).fill(0).map(() => [0, 1, 2, 3, 4].map((cc) => cc === c ? "1" : "0").join("")).join("")
);
const DIAG1 = G(
  "1000001000001000001000001"
);
const DIAG2 = G(
  "0000100010001000100010000"
);
const LINES = [
  ROW(0),
  ROW(1),
  ROW(2),
  ROW(3),
  ROW(4),
  COL(0),
  COL(1),
  COL(2),
  COL(3),
  COL(4),
  DIAG1,
  DIAG2
];
const STAMPS = (() => {
  const out = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const m = Array(25).fill(0);
      [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]].forEach(([rr, cc]) => {
        m[rr * 5 + cc] = 1;
      });
      out.push(m);
    }
  }
  return out;
})();
const SMALL_SQUARES = (() => {
  const out = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const m = Array(25).fill(0);
      for (let dr = 0; dr < 3; dr++)
        for (let dc = 0; dc < 3; dc++) m[(r + dr) * 5 + (c + dc)] = 1;
      out.push(m);
    }
  }
  return out;
})();
const or = (...ms) => ms.reduce((a, m) => a.map((v, i) => v || m[i] ? 1 : 0), Array(25).fill(0));
const rot90 = (m) => {
  const out = Array(25).fill(0);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) out[c * 5 + (4 - r)] = m[r * 5 + c];
  return out;
};
const flipH = (m) => {
  const out = Array(25).fill(0);
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) out[r * 5 + (4 - c)] = m[r * 5 + c];
  return out;
};
const maskKey = (m) => m.join("");
const uniq = (arr) => {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const m of arr) {
    const k = maskKey(m);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(m);
    }
  }
  return out;
};
const orientations = (m) => {
  const r0 = m, r1 = rot90(r0), r2 = rot90(r1), r3 = rot90(r2);
  return uniq([r0, r1, r2, r3, flipH(r0), flipH(r1), flipH(r2), flipH(r3)]);
};
const translations = (m) => {
  let minR = 5, maxR = -1, minC = 5, maxC = -1;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) if (m[r * 5 + c]) {
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    if (c < minC) minC = c;
    if (c > maxC) maxC = c;
  }
  if (maxR < 0) return [m];
  const out = [];
  for (let dr = -minR; dr + maxR <= 4; dr++) {
    for (let dc = -minC; dc + maxC <= 4; dc++) {
      const nm = Array(25).fill(0);
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        if (m[r * 5 + c]) nm[(r + dr) * 5 + (c + dc)] = 1;
      }
      out.push(nm);
    }
  }
  return uniq(out);
};
const variants = (m) => {
  const all = [];
  for (const o of orientations(m)) all.push(...translations(o));
  return uniq(all);
};
const PATTERNS = [
  // Lines — any single line wins
  { id: "single_line", label: "Single Line (Any)", category: "lines", masks: LINES },
  // Specific line positions (one mask each — must complete THAT exact line)
  { id: "line_top", label: "Top Row", category: "lines", masks: [ROW(0)] },
  { id: "line_upper", label: "Upper Row", category: "lines", masks: [ROW(1)] },
  { id: "line_middle", label: "Middle Row", category: "lines", masks: [ROW(2)] },
  { id: "line_lower", label: "Lower Row", category: "lines", masks: [ROW(3)] },
  { id: "line_bottom", label: "Bottom Row", category: "lines", masks: [ROW(4)] },
  { id: "line_left", label: "Left Column", category: "lines", masks: [COL(0)] },
  { id: "line_center_v", label: "Center Column", category: "lines", masks: [COL(2)] },
  { id: "line_right", label: "Right Column", category: "lines", masks: [COL(4)] },
  { id: "line_diag_tl", label: "Diagonal ↘", category: "lines", masks: [DIAG1] },
  { id: "line_diag_tr", label: "Diagonal ↙", category: "lines", masks: [DIAG2] },
  { id: "double_line", label: "Double Line", category: "lines", masks: LINES, requiredCount: 2 },
  {
    id: "full_house",
    label: "Full House (Blackout)",
    category: "lines",
    masks: [G("11111 11111 11111 11111 11111")]
  },
  {
    id: "four_corners",
    label: "Four Corners",
    category: "lines",
    masks: [G("10001 00000 00000 00000 10001")]
  },
  { id: "postage_stamp", label: "Postage Stamp (2×2)", category: "lines", masks: STAMPS },
  {
    id: "center_cross",
    label: "Center Cross",
    category: "lines",
    masks: variants(or(ROW(2), COL(2)))
  },
  // Letters (all rotations/reflections + translations where they fit)
  {
    id: "x_pattern",
    label: "X Pattern",
    category: "letters",
    masks: uniq([
      or(DIAG1, DIAG2),
      // smaller X's translated across the board so the player can hit one anywhere
      ...variants(G("10001 01010 00100 01010 10001")),
      ...variants(G("00000 01010 00100 01010 00000"))
    ])
  },
  {
    id: "t_pattern",
    label: "T Pattern",
    category: "letters",
    masks: variants(or(ROW(0), COL(2)))
  },
  {
    id: "l_pattern",
    label: "L Pattern",
    category: "letters",
    masks: variants(or(COL(0), ROW(4)))
  },
  {
    id: "h_pattern",
    label: "H Pattern",
    category: "letters",
    masks: variants(or(COL(0), COL(4), ROW(2)))
  },
  {
    id: "u_pattern",
    label: "U Pattern",
    category: "letters",
    masks: variants(or(COL(0), COL(4), ROW(4)))
  },
  {
    id: "z_pattern",
    label: "Z Pattern",
    category: "letters",
    masks: variants(or(ROW(0), ROW(4), DIAG2))
  },
  // Blocks
  { id: "small_square", label: "Small Square (3×3)", category: "blocks", masks: SMALL_SQUARES },
  {
    id: "large_square",
    label: "Large Square / Frame",
    category: "blocks",
    masks: variants(G("11111 10001 10001 10001 11111"))
  },
  {
    id: "diamond",
    label: "Diamond",
    category: "blocks",
    masks: variants(G("00100 01010 10001 01010 00100"))
  },
  {
    id: "arrow",
    label: "Arrow",
    category: "blocks",
    masks: variants(G("00100 01110 11111 00100 00100"))
  },
  {
    id: "checkerboard",
    label: "Checkerboard",
    category: "blocks",
    masks: [G("10101 01010 10101 01010 10101"), G("01010 10101 01010 10101 01010")]
  },
  // Fun / specialty — all positions allowed wherever the shape fits
  {
    id: "crazy_kite",
    label: "Crazy Kite",
    category: "fun",
    masks: variants(G("00100 01110 11111 00100 00100"))
  },
  {
    id: "pyramid",
    label: "Pyramid",
    category: "fun",
    masks: variants(G("00100 01110 11111 00000 00000"))
  },
  {
    id: "heart",
    label: "Heart",
    category: "fun",
    masks: variants(G("01010 11111 11111 01110 00100"))
  },
  {
    id: "butterfly",
    label: "Butterfly",
    category: "fun",
    masks: variants(G("10101 11111 00100 11111 10101"))
  },
  {
    id: "wine_glass",
    label: "Wine Glass",
    category: "fun",
    masks: variants(G("11111 01110 00100 00100 01110"))
  },
  {
    id: "anchor",
    label: "Anchor",
    category: "fun",
    masks: variants(G("00100 01010 00100 10101 01110"))
  },
  {
    id: "clock",
    label: "Clock",
    category: "fun",
    masks: variants(or(ROW(0), ROW(4), COL(0), COL(4), G("00000 00000 00100 00000 00000")))
  },
  {
    id: "sputnik",
    label: "Sputnik",
    category: "fun",
    masks: [G("10101 01010 10101 01010 10101"), G("01010 10101 01010 10101 01010")]
  }
];
function patternById(id) {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}
function checkWin(p, daubed) {
  const covers = (mask) => mask.every((v, i) => v === 0 || daubed.has(i));
  const need = p.requiredCount ?? 1;
  let count = 0;
  for (const m of p.masks) {
    if (covers(m)) {
      count++;
      if (count >= need) return true;
    }
  }
  return false;
}
function previewMask(p) {
  if (p.masks.length === 1) return p.masks[0];
  return p.masks[0];
}
const $$splitComponentImporter = () => import("./index-o383v2Fp.js");
const BOT_USERNAME = "ETfastbingo_bot";
const Route = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const IndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$1
});
const rootRouteChildren = {
  IndexRoute
};
const routeTree = Route$1._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  BOT_USERNAME as B,
  PATTERNS as P,
  previewMask as a,
  checkWin as c,
  patternById as p,
  router as r
};
