const PAL = {
  " ": null,
  k: "#1a120c",
  h: "#3a2416",
  s: "#efc9a0",
  d: "#c99a6c",
  w: "#f6f1e6",
  g: "#d4cec0",
  m: "#b3ad9e",
  e: "#1a120c",
  b: "#8e0a1c",
};

const KID = [
  "      hhhhhh      ",
  "     hksssskh     ",
  "     ksessesk     ",
  "      kssssk      ",
  "     kwwwwwwk     ",
  "    kwwwwwwwwk    ",
  "    kskkwwkksk    ",
  "      krrrrk      ",
  "      kwwwwk      ",
  "      kwwwwk      ",
  "      kwk kwk     ",
  "      ksk ksk     ",
  "      kkk kkk     ",
];

const TEEN = [
  "       hhhhh      ",
  "      hksssskh    ",
  "      ksessesk    ",
  "       kdssdk     ",
  "      kwwwwwwk    ",
  "     kwwwwwwwwk   ",
  "    kskwwwwwwksk  ",
  "      kwrrrrwk    ",
  "      kwwwwwwk    ",
  "      kgwwwwgk    ",
  "      kwwk kwwk   ",
  "      kwwk kwwk   ",
  "      kssk kssk   ",
  "      kkkk kkkk   ",
];

const ADULT = [
  "      hhhhhhhh    ",
  "     hksssssskh   ",
  "     kssessessk   ",
  "      kdssssdk    ",
  "     kwwwwwwwwk   ",
  "    kwwwwwwwwwwk  ",
  "   kskkwwwwwwkksk ",
  "     kwwrrrrwwk   ",
  "     kgwwwwwwgk   ",
  "     kmwwwwwwmk   ",
  "     kwwk  kwwk   ",
  "     kwwk  kwwk   ",
  "     kssk  kssk   ",
  "     kkkk  kkkk   ",
];

function drawSprite(canvas, rows, scale, bob = 0) {
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  canvas.width = w * scale;
  canvas.height = (h + 2) * scale;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < h; y += 1) {
    const row = rows[y];
    for (let x = 0; x < row.length; x += 1) {
      const color = PAL[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, (y + bob) * scale, scale, scale);
    }
  }
}

document.querySelectorAll("[data-sprite]").forEach((canvas) => {
  const kind = canvas.getAttribute("data-sprite");
  const map = { kid: KID, teen: TEEN, adult: ADULT };
  drawSprite(canvas, map[kind], 5, 1);
});

const TG = "https://t.me/Dima_zhyck";
let pick = "";

function tgUrl() {
  if (!pick) return TG;
  const text = `Привет! Хочу индивидуальную тренировку. Слот: ${pick}.`;
  return `${TG}?text=${encodeURIComponent(text)}`;
}

function syncLinks() {
  const url = tgUrl();
  document.querySelectorAll(".js-tg").forEach((a) => {
    a.setAttribute("href", url);
  });
}

document.querySelectorAll(".slot").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".slot").forEach((other) => {
      other.classList.remove("is-on");
      other.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("is-on");
    btn.setAttribute("aria-pressed", "true");
    pick = btn.getAttribute("data-pick") || "";
    const foot = document.querySelector(".select__foot");
    if (foot) foot.textContent = `Выбран слот: ${pick}. Тренер один.`;
    syncLinks();
  });
});

syncLinks();

const BPM = 148;
const STEP = 60 / BPM / 2;
const LEAD = [
  76, 0, 79, 81, 79, 0, 76, 72, 76, 79, 81, 84, 83, 81, 79, 0,
  72, 0, 76, 79, 76, 72, 67, 0, 69, 72, 76, 79, 77, 76, 72, 69,
];
const HARM = [
  69, 0, 72, 76, 72, 0, 69, 64, 69, 72, 76, 79, 77, 76, 72, 0,
  64, 0, 69, 72, 69, 64, 60, 0, 62, 64, 69, 72, 71, 69, 64, 62,
];
const BASS = [
  40, 40, 40, 47, 40, 40, 43, 43, 40, 40, 40, 47, 36, 36, 38, 38,
  40, 40, 40, 47, 40, 40, 43, 43, 45, 45, 43, 43, 38, 38, 40, 40,
];
const KICK = [
  1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0,
  1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0,
];
const SNARE = [
  0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
  0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0,
];

function midiHz(n) {
  return 440 * 2 ** ((n - 69) / 12);
}

function makeNoise(ctx) {
  const len = ctx.sampleRate * 0.25;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buf;
}

let audio;
let master;
let noiseBuf;
let timer = 0;
let playing = false;
let step = 0;

function bootAudio() {
  if (audio) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio = new AC();
    master = audio.createGain();
    master.gain.value = 0.18;
    master.connect(audio.destination);
    noiseBuf = makeNoise(audio);
  } catch (err) {
    audio = null;
  }
}

function beep(freq, dur, type, vol, when) {
  const o = audio.createOscillator();
  const g = audio.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, when);
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
  o.connect(g);
  g.connect(master);
  o.start(when);
  o.stop(when + dur);
}

function noiseHit(dur, vol, when) {
  const src = audio.createBufferSource();
  const g = audio.createGain();
  const f = audio.createBiquadFilter();
  src.buffer = noiseBuf;
  f.type = "highpass";
  f.frequency.value = 1800;
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.0008, when + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(when);
  src.stop(when + dur);
}

function tick() {
  if (!playing || !audio) return;
  const now = audio.currentTime;
  if (!Number.isFinite(now)) return;
  if (timer < now - 0.4) timer = now;
  const ahead = now + 0.12;
  let guard = 0;
  while (timer < ahead && guard < 16) {
    const i = step % LEAD.length;
    if (LEAD[i]) beep(midiHz(LEAD[i]), STEP * 0.85, "square", 0.07, timer);
    if (HARM[i]) beep(midiHz(HARM[i]), STEP * 0.8, "square", 0.035, timer);
    if (BASS[i]) beep(midiHz(BASS[i]), STEP * 0.95, "triangle", 0.11, timer);
    if (KICK[i]) beep(70, STEP * 0.35, "sine", 0.16, timer);
    if (SNARE[i]) noiseHit(STEP * 0.28, 0.12, timer);
    timer += STEP;
    step += 1;
    guard += 1;
  }
}

function setBgmUi(on) {
  const btn = document.getElementById("bgm");
  if (!btn) return;
  btn.classList.toggle("is-on", on);
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.textContent = on ? "BGM ON" : "BGM OFF";
}

async function startBgm() {
  try {
    bootAudio();
    if (!audio) return;
    await audio.resume();
    if (playing) return;
    playing = true;
    timer = audio.currentTime + 0.05;
    step = 0;
    tick();
    setBgmUi(true);
  } catch (err) {
    playing = false;
    setBgmUi(false);
  }
}

function stopBgm() {
  playing = false;
  setBgmUi(false);
}

setInterval(tick, 40);

document.getElementById("bgm")?.addEventListener("click", () => {
  if (playing) stopBgm();
  else startBgm();
});

document.getElementById("coin")?.addEventListener("click", () => {
  startBgm();
});

window.addEventListener("load", () => startBgm());
["pointerdown", "keydown", "touchstart"].forEach((evt) => {
  window.addEventListener(evt, () => startBgm(), { once: true, passive: true });
});

let remain = 10;
const clock = document.getElementById("continue-timer");
const face = document.getElementById("continue-face");
setInterval(() => {
  if (!clock) return;
  remain -= 1;
  if (remain < 0) remain = 10;
  const ko = remain === 0;
  clock.hidden = ko;
  if (face) face.hidden = !ko;
  if (!ko) clock.textContent = String(remain);
}, 1000);

document.querySelectorAll(".slot").forEach((btn) => {
  btn.addEventListener("click", () => {
    bootAudio();
    audio.resume();
    const t = audio.currentTime + 0.01;
    beep(880, 0.07, "square", 0.08, t);
    beep(1320, 0.09, "square", 0.06, t + 0.06);
  });
});

