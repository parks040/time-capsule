// =========================
// Time Capsule — Memory Dust (LIGHT + DENSE, PNG + MP4)
// images: assets/memory-1.png  ~ assets/memory-37.png
// videos: assets/memory-38.mp4 ~ assets/memory-44.mp4
// Goal: less empty, still light (no heavy duplicate DOM, lazy video load)
// =========================

// ✅ counts (edit only if your filenames change)
const IMAGE_COUNT = 37;
const VIDEO_START = 38;
const VIDEO_END = 44;

// ✅ density (keep light)
// 1 = 44 fragments, 2 = 88 fragments (recommended), 3+ can feel heavy
const MULTIPLIER = 2;

// ✅ videos: keep them light by NOT loading until click
const LAZY_VIDEO = true;

// Build base fragments list (no auto-detect)
const BASE = [];
for (let i = 1; i <= IMAGE_COUNT; i++) BASE.push({ type: "image", src: `assets/memory-${i}.png` });
for (let i = VIDEO_START; i <= VIDEO_END; i++) BASE.push({ type: "video", src: `assets/memory-${i}.mp4` });

// Make final FRAGMENTS without duplicating too much (still okay at x2)
const FRAGMENTS = [];
for (let m = 0; m < MULTIPLIER; m++) {
  BASE.forEach((item) => FRAGMENTS.push({ ...item }));
}

// Soft inner voice lines
const THOUGHTS = [
  "I learned to live with it.",
  "Some things softened over time.",
  "I made peace with myself.",
  "I let it pass.",
  "I stayed quiet and breathed.",
  "이제는 괜찮다고 말할 수 있어.",
  "조금은 내려놓을 수 있게 됐어.",
  "그때의 나를 이해하게 됐어.",
  "시간이 나를 안아준 것 같아.",
  "이 기억도 나의 일부야.",
  "I don’t need answers anymore.",
  "I stopped asking why.",
  "It doesn’t hurt the same way now.",
  "I survived gently.",
  "I’m still here, calmly.",
];

// Glitch punch lines
const PUNCH_LINES = [
  "NO, I’M NOT OVER THIS",
  "THIS STILL HURTS",
  "DON’T LIE TO YOURSELF",
  "I PRETENDED TOO LONG",
  "THIS WASN’T OK",
  "I NEVER SAID THIS OUT LOUD",
  "I WAS BREAKING",
  "THIS IS THE TRUTH",
  "STOP MINIMIZING IT",
  "I STILL FEEL IT",
];

const startEl = document.getElementById("start");
const sceneEl = document.getElementById("scene");
const punchEl = document.getElementById("punch");

let clickTimes = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------- Layout rules ----------
function randomPositionAvoidCenter() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // small breathing space center (not too empty)
  const cx1 = vw * 0.46, cx2 = vw * 0.54;
  const cy1 = vh * 0.46, cy2 = vh * 0.54;

  let x = 0, y = 0;
  for (let i = 0; i < 30; i++) {
    x = rand(0, vw);
    y = rand(0, vh);
    const inCenter = x > cx1 && x < cx2 && y > cy1 && y < cy2;
    if (!inCenter) break;
  }
  return { x, y };
}

function sizeBucket() {
  // Dense but light feeling:
  // tiny 78%, medium 20%, large 2% (big is rare)
  const r = Math.random();
  if (r < 0.78) return { w: rand(38, 74),  h: rand(38, 82) };     // tiny
  if (r < 0.98) return { w: rand(84, 140), h: rand(84, 156) };    // medium
  return { w: rand(170, 230), h: rand(150, 230) };                // large (rare)
}

// ---------- Create & interactions ----------
function createFragment(item) {
  const frag = document.createElement("div");
  frag.className = "fragment";

  const { w, h } = sizeBucket();
  const { x, y } = randomPositionAvoidCenter();

  frag.style.setProperty("--w", `${w}px`);
  frag.style.setProperty("--h", `${h}px`);
  frag.style.left = `${x - w / 2}px`;
  frag.style.top = `${y - h / 2}px`;

  // slightly calmer drift so many items don't feel chaotic/heavy
  frag.style.setProperty("--dur", `${rand(10, 22).toFixed(2)}s`);
  frag.style.setProperty("--dx1", `${rand(-10, 10).toFixed(1)}px`);
  frag.style.setProperty("--dy1", `${rand(-12, 12).toFixed(1)}px`);
  frag.style.setProperty("--dx2", `${rand(-14, 14).toFixed(1)}px`);
  frag.style.setProperty("--dy2", `${rand(-16, 16).toFixed(1)}px`);
  frag.style.setProperty("--r1",  `${rand(-2, 2).toFixed(2)}deg`);
  frag.style.setProperty("--r2",  `${rand(-2.6, 2.6).toFixed(2)}deg`);

  if (item.type === "video") {
    const v = document.createElement("video");
    v.muted = true;
    v.loop = true;
    v.playsInline = true;

    // ✅ keep light: don't load video until click
    if (LAZY_VIDEO) {
      v.dataset.src = item.src;
      v.preload = "none";
    } else {
      v.src = item.src;
      v.preload = "metadata";
    }

    frag.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "memory";
    img.loading = "lazy";
    img.decoding = "async";
    frag.appendChild(img);
  }

  frag.addEventListener("click", (e) => {
    e.stopPropagation();
    onFragmentClick(frag);
  });

  return frag;
}

function onFragmentClick(frag) {
  // 0.5s color flash
  frag.classList.add("flash");
  setTimeout(() => frag.classList.remove("flash"), 500);

  // bring forward briefly
  frag.style.zIndex = "90";
  setTimeout(() => (frag.style.zIndex = ""), 700);

  // if video, load + play briefly
  const v = frag.querySelector("video");
  if (v) {
    if (LAZY_VIDEO && !v.src) v.src = v.dataset.src; // ✅ load on demand
    v.play().catch(() => {});
    setTimeout(() => v.pause(), 2200);
  }

  spawnThoughtNear(frag);

  // click combo for glitch punch (5 clicks within 1.2s)
  const now = Date.now();
  clickTimes = clickTimes.filter((t) => now - t < 1200);
  clickTimes.push(now);

  if (clickTimes.length >= 5) {
    clickTimes = [];
    triggerGlitchPunch();
  }
}

function spawnThoughtNear(frag) {
  const rect = frag.getBoundingClientRect();
  const t = document.createElement("div");
  t.className = "thought";
  t.textContent = pick(THOUGHTS);

  const ox = rand(-50, 50);
  const oy = rand(-35, 35);
  t.style.left = `${rect.left + rect.width / 2 + ox}px`;
  t.style.top = `${rect.top + rect.height / 2 + oy}px`;

  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1900);
}

function triggerGlitchPunch() {
  document.body.classList.add("glitch");

  punchEl.textContent = pick(PUNCH_LINES);
  punchEl.classList.remove("hidden");
  punchEl.classList.add("glitchText");

  setTimeout(() => {
    document.body.classList.remove("glitch");
    punchEl.classList.add("hidden");
    punchEl.classList.remove("glitchText");
    punchEl.textContent = "";
  }, 1400);
}

// ---------- Start experience ----------
function startExperience() {
  // shuffle for chaotic feel
  FRAGMENTS.sort(() => Math.random() - 0.5);

  FRAGMENTS.forEach((item) => {
    const frag = createFragment(item);
    sceneEl.appendChild(frag);
  });
}

// Start screen click
startEl.addEventListener("click", () => {
  startEl.classList.add("hidden");
  sceneEl.classList.remove("hidden");
  startExperience();
});
