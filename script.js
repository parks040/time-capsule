// =========================
// Time Capsule — Memory Dust
// Auto-load memory-1 ~ memory-66 from /assets (mixed extensions)
// =========================

// How many files you have (1..66)
const MAX_MEMORY = 44;

// Candidate extensions (because yours are mixed: JPG/JPEG/PNG and mp4/MP4)
const IMAGE_EXTS = ["webp"];
const VIDEO_EXTS = ["mp4"];

// Will be filled automatically
const FRAGMENTS = [];

// images: memory-1.webp ~ memory-37.webp
for (let i = 1; i <= 37; i++) {
  FRAGMENTS.push({
    type: "image",
    src: `assets/memory-${i}.webp`
  });
}

// videos: memory-38.mp4 ~ memory-44.mp4
for (let i = 38; i <= 44; i++) {
  FRAGMENTS.push({
    type: "video",
    src: `assets/memory-${i}.mp4`
  });
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
  "I’m still here, calmly."
];


// Glitch punch lines
const PUNCH_LINES = [
  "NO, I’M NOT OVER THIS",
  "THIS STILL HURTS",
  "DON’T LIE TO YOURSELF",
  "I PRETENDED TOO LONG",
  "THIS WASN’T OK",

  "아직 괜찮지 않아",
  "나는 아무렇지 않았던 적 없어",
  "이건 그냥 지나간 일이 아니야",
  "그때 너무 아팠어",
  "왜 아무도 몰랐지",

  "I NEVER SAID THIS OUT LOUD",
  "I WAS BREAKING",
  "THIS IS THE TRUTH",
  "STOP MINIMIZING IT",
  "I STILL FEEL IT"
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

// ---------- File exists helpers ----------
function fileExists(url, isVideo = false) {
  return new Promise((resolve) => {
    if (isVideo) {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () => resolve(true);
      v.onerror = () => resolve(false);
      v.src = url;
    } else {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    }
  });
}

async function buildFragments() {
  for (let i = 1; i <= MAX_MEMORY; i++) {
    // Try video first (so memory-1.mp4 becomes video)
    let added = false;

    for (const ext of VIDEO_EXTS) {
      const path = `assets/memory-${i}.${ext}`;
      if (await fileExists(path, true)) {
        FRAGMENTS.push({ type: "video", src: path });
        added = true;
        break;
      }
    }
    if (added) continue;

    // Otherwise try image
    for (const ext of IMAGE_EXTS) {
      const path = `assets/memory-${i}.${ext}`;
      if (await fileExists(path, false)) {
        FRAGMENTS.push({ type: "img", src: path });
        added = true;
        break;
      }
    }
  }

  // Shuffle for chaotic feel
  FRAGMENTS.sort(() => Math.random() - 0.5);
}

// ---------- Layout rules ----------
function randomPositionAvoidCenter() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // keep a breathing space in the center
  const cx1 = vw * 0.38, cx2 = vw * 0.62;
  const cy1 = vh * 0.38, cy2 = vh * 0.62;

  let x = rand(0, vw);
  let y = rand(0, vh);

  for (let i = 0; i < 20; i++) {
    x = rand(0, vw);
    y = rand(0, vh);
    const inCenter = x > cx1 && x < cx2 && y > cy1 && y < cy2;
    if (!inCenter) break;
  }
  return { x, y };
}

function sizeBucket() {
  // S 70%, M 25%, L 5%
  const r = Math.random();
  if (r < 0.70) return { w: rand(46, 82),  h: rand(46, 86) };   // small
  if (r < 0.95) return { w: rand(90, 140), h: rand(90, 150) }; // medium
  return { w: rand(160, 220), h: rand(140, 220) };             // large
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
  frag.style.top  = `${y - h / 2}px`;

  frag.style.setProperty("--dur", `${rand(8, 18).toFixed(2)}s`);
  frag.style.setProperty("--dx1", `${rand(-14, 14).toFixed(1)}px`);
  frag.style.setProperty("--dy1", `${rand(-16, 16).toFixed(1)}px`);
  frag.style.setProperty("--dx2", `${rand(-18, 18).toFixed(1)}px`);
  frag.style.setProperty("--dy2", `${rand(-20, 20).toFixed(1)}px`);
  frag.style.setProperty("--r1",  `${rand(-2, 2).toFixed(2)}deg`);
  frag.style.setProperty("--r2",  `${rand(-3, 3).toFixed(2)}deg`);

  if (item.type === "video") {
    const v = document.createElement("video");
    v.src = item.src;
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    v.preload = "metadata";
    frag.appendChild(v);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "memory";
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

  // if video, play briefly
  const v = frag.querySelector("video");
  if (v) {
    v.play().catch(() => {});
    setTimeout(() => v.pause(), 2200);
  }

  spawnThoughtNear(frag);

  // click combo for glitch punch (5 clicks within 1.2s)
  const now = Date.now();
  clickTimes = clickTimes.filter(t => now - t < 1200);
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
  t.style.top  = `${rect.top + rect.height / 2 + oy}px`;

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
async function startExperience() {
  await buildFragments();

  // safety
  if (FRAGMENTS.length === 0) {
    console.warn("No fragments found. Check /assets filenames and paths.");
    return;
  }

  FRAGMENTS.forEach((item) => {
    const frag = createFragment(item);
    sceneEl.appendChild(frag);
  });
}

startEl.addEventListener("click", async () => {
  startEl.classList.add("hidden");
  sceneEl.classList.remove("hidden");
  await startExperience();
});
