// -------- FILE COUNTS --------
const IMAGE_COUNT = 37;
const VIDEO_START = 38;
const VIDEO_END = 44;
const MULTIPLIER = 2; // density
const LAZY_VIDEO = true;

// -------- BUILD BASE --------
const BASE = [];
for (let i = 1; i <= IMAGE_COUNT; i++)
  BASE.push({ type: "image", src: `assets/memory-${i}.png` });

for (let i = VIDEO_START; i <= VIDEO_END; i++)
  BASE.push({ type: "video", src: `assets/memory-${i}.mp4` });

const FRAGMENTS = [];
for (let m = 0; m < MULTIPLIER; m++)
  BASE.forEach(item => FRAGMENTS.push({ ...item }));

// -------- TEXT --------
const THOUGHTS = [
  "I learned to live with it.",
  "이제는 괜찮다고 말할 수 있어.",
  "Some things softened.",
  "조금은 내려놓았어.",
  "I stayed quiet and breathed."
];

const PUNCH_LINES = [
  "THIS STILL HURTS",
  "DON’T LIE",
  "I WAS BREAKING",
  "I STILL FEEL IT"
];

// -------- DOM --------
const startEl = document.getElementById("start");
const sceneEl = document.getElementById("scene");
const punchEl = document.getElementById("punch");

let clickTimes = [];

function rand(min,max){ return Math.random()*(max-min)+min; }
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

// -------- LAYOUT --------
function sizeBucket(){
  const r=Math.random();
  if(r<0.75) return {w:rand(45,85),h:rand(45,85)};
  if(r<0.97) return {w:rand(90,150),h:rand(90,150)};
  return {w:rand(160,220),h:rand(160,220)};
}

function createFragment(item){
  const frag=document.createElement("div");
  frag.className="fragment";

  const {w,h}=sizeBucket();
  frag.style.setProperty("--w",`${w}px`);
  frag.style.setProperty("--h",`${h}px`);
  frag.style.left=`${rand(0,window.innerWidth-w)}px`;
  frag.style.top=`${rand(0,window.innerHeight-h)}px`;

  frag.style.setProperty("--dur",`${rand(10,22)}s`);
  frag.style.setProperty("--dx1",`${rand(-10,10)}px`);
  frag.style.setProperty("--dy1",`${rand(-10,10)}px`);
  frag.style.setProperty("--dx2",`${rand(-15,15)}px`);
  frag.style.setProperty("--dy2",`${rand(-15,15)}px`);
  frag.style.setProperty("--r1",`${rand(-2,2)}deg`);
  frag.style.setProperty("--r2",`${rand(-2,2)}deg`);

  if(item.type==="video"){
    const v=document.createElement("video");
    v.muted=true;
    v.loop=true;
    v.playsInline=true;
    if(LAZY_VIDEO){
      v.dataset.src=item.src;
      v.preload="none";
    }else{
      v.src=item.src;
    }
    frag.appendChild(v);
  }else{
    const img=document.createElement("img");
    img.src=item.src;
    img.loading="lazy";
    frag.appendChild(img);
  }

  frag.addEventListener("click",e=>{
    e.stopPropagation();
    onFragmentClick(frag);
  });

  return frag;
}

// -------- INTERACTION --------
function onFragmentClick(frag){
  frag.classList.add("flash");
  setTimeout(()=>frag.classList.remove("flash"),500);

  const v=frag.querySelector("video");
  if(v){
    if(LAZY_VIDEO && !v.src) v.src=v.dataset.src;
    v.play().catch(()=>{});
    setTimeout(()=>v.pause(),2000);
  }

  spawnThought(frag);

  const now=Date.now();
  clickTimes=clickTimes.filter(t=>now-t<1200);
  clickTimes.push(now);
  if(clickTimes.length>=5){
    clickTimes=[];
    triggerGlitch();
  }
}

function spawnThought(frag){
  const rect=frag.getBoundingClientRect();
  const t=document.createElement("div");
  t.className="thought";
  t.textContent=pick(THOUGHTS);
  t.style.left=`${rect.left+rect.width/2}px`;
  t.style.top=`${rect.top+rect.height/2}px`;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1800);
}

function triggerGlitch(){
  document.body.classList.add("glitch");
  punchEl.textContent=pick(PUNCH_LINES);
  punchEl.classList.remove("hidden");
  punchEl.classList.add("glitchText");

  setTimeout(()=>{
    document.body.classList.remove("glitch");
    punchEl.classList.add("hidden");
    punchEl.classList.remove("glitchText");
  },1300);
}

// -------- START --------
function startExperience(){
  FRAGMENTS.sort(()=>Math.random()-0.5);
  FRAGMENTS.forEach(item=>{
    sceneEl.appendChild(createFragment(item));
  });
}

startEl.addEventListener("click",()=>{
  startEl.classList.add("hidden");
  sceneEl.classList.remove("hidden");
  startExperience();
});

