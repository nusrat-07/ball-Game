const API_BASE = "http://localhost:3000";

// UI
const uiScore = document.getElementById("uiScore");
const uiCoins = document.getElementById("uiCoins");
const uiBest  = document.getElementById("uiBest");

const overlay  = document.getElementById("overlay");
const ovTitle  = document.getElementById("ovTitle");
const ovText   = document.getElementById("ovText");
const btnStart = document.getElementById("btnStart");
const nameInput = document.getElementById("playerName");

const modal = document.getElementById("modal");
const boardEl = document.getElementById("board");
const btnBoard = document.getElementById("btnBoard");
const btnClose = document.getElementById("btnClose");
const btnPause = document.getElementById("btnPause");

// Canvas
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d", { alpha: true });

let W = 1, H = 1;

// Background
let clouds = [];
let stars = [];
let starT = 0;

function rebuildBackground() {
  clouds = [];
  stars = [];
  starT = 0;

  const cloudCount = Math.max(6, Math.floor(W / 220));
  const starCount  = Math.max(80, Math.floor((W * H) / 14000));

  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * W,
      y: 50 + Math.random() * (H * 0.35),
      size: 50 + Math.random() * 60,
      speed: 10 + Math.random() * 22,
    });
  }

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      size: 0.7 + Math.random() * 1.8,
      alpha: 0.12 + Math.random() * 0.65,
      tw: 0.4 + Math.random() * 1.0,
    });
  }
}

function resizeCanvasToDisplaySize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // if layout not ready, skip
  if (!rect.width || !rect.height) return;

  W = Math.floor(rect.width);
  H = Math.floor(rect.height);

  const pxW = Math.floor(rect.width * dpr);
  const pxH = Math.floor(rect.height * dpr);

  if (canvas.width !== pxW || canvas.height !== pxH) {
    canvas.width = pxW;
    canvas.height = pxH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rebuildBackground();
  }
}

window.addEventListener("resize", () => {
  resizeCanvasToDisplaySize();
  // reposition ball so it never disappears after resize
  ball.x = Math.max(120, Math.floor(W * 0.25));
  ball.y = Math.min(H - ball.r - 10, Math.max(ball.r + 10, ball.y));
});

// API
async function submitScoreToServer(playerName, distanceScore, coins) {
  await fetch(`${API_BASE}/api/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerName,
      score: distanceScore,
      coins: coins
    }),
  });
}


async function fetchLeaderboard(limit = 10) {
  const r = await fetch(`${API_BASE}/api/leaderboard?limit=${limit}`);
  const data = await r.json();
  return data.rows || [];
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

async function openLeaderboard() {
  modal.classList.remove("hidden");
  boardEl.innerHTML = `<div class="muted">Loading…</div>`;
  try {
    const rows = await fetchLeaderboard(10);
    if (!rows.length) {
      boardEl.innerHTML = `<div class="muted">No scores yet.</div>`;
      return;
    }
    boardEl.innerHTML = rows.map((r, i) => `
      <div class="boardRow">
        <div>#${i + 1} <b>${escapeHtml(r.PLAYER_NAME ?? "Guest")}</b></div>
        <div><b>${r.SCORE}</b></div>
      </div>
    `).join("");
  } catch {
    boardEl.innerHTML = `<div class="muted">Could not load leaderboard.</div>`;
  }
}
function closeLeaderboard() { modal.classList.add("hidden"); }

// Overlay
function showOverlay(title, text, buttonText="Start") {
  ovTitle.textContent = title;
  ovText.textContent = text;
  btnStart.textContent = buttonText;
  overlay.style.display = "grid";
}
function hideOverlay(){ overlay.style.display = "none"; }

// State
let bestDistance = Number(localStorage.getItem("best_distance") || 0);
uiBest.textContent = String(bestDistance);

let distance = 0;
let coinsCollected = 0;
let state = "menu";
let lastT = 0;
let playerName = "Guest";
let submitted = false;

// Player
const ball = { x: 120, y: 200, r: 14, vy: 0 };
const GRAVITY = 1800;
const FLAP = 520;

// Coins + Enemies
const coins = [];
const enemies = [];
let coinSpawnT = 0;
let enemySpawnT = 0;

function spawnCoin() {
  coins.push({
    x: W + 60,
    y: Math.max(90, Math.min(H - 90, 120 + Math.random() * (H - 240))),
    r: 10,
    collected: false,
    wobble: Math.random() * Math.PI * 2,
  });
}

function spawnEnemy() {
  const r = 14 + Math.random() * 10;
  enemies.push({
    x: W + 80,
    y: Math.max(90, Math.min(H - 90, 100 + Math.random() * (H - 200))),
    r,
    wobble: Math.random() * Math.PI * 2,
    speed: 240 + Math.random() * 160,
  });
}

function circleCircleHit(ax, ay, ar, bx, by, br) {
  const dx = ax - bx;
  const dy = ay - by;
  const rr = ar + br;
  return (dx * dx + dy * dy) <= (rr * rr);
}

// Reset / Over
function reset() {
  ball.x = Math.max(120, Math.floor(W * 0.25));
  ball.y = Math.floor(H * 0.4);
  ball.vy = 0;

  coins.length = 0;
  enemies.length = 0;

  distance = 0;
  coinsCollected = 0;
  submitted = false;

  coinSpawnT = 0.8;
  enemySpawnT = 1.2;

  state = "play";
  hideOverlay();
}

function gameOver(reason) {
  if (state === "over") return;
  state = "over";

  const score = Math.floor(distance);
  if (score > bestDistance) {
    bestDistance = score;
    localStorage.setItem("best_distance", String(bestDistance));
  }

  showOverlay("Game Over", `Distance: ${score} • Coins: ${coinsCollected} • ${reason}`, "Restart");

  if (!submitted) {
    submitted = true;
    submitScoreToServer(playerName || "Guest", score, coinsCollected).catch(()=>{});
  }
}

// Controls
function startFromUI() {
  playerName = (nameInput.value || "Guest").trim().slice(0,24) || "Guest";
  reset();
}

function flap() {
  if (state === "menu") return startFromUI();
  if (state === "over") return reset();
  if (state === "pause") return;
  if (state !== "play") return;
  ball.vy = -FLAP;
}

function togglePause() {
  if (state === "play") {
    state = "pause";
    showOverlay("Paused", "Press ⏸ or Space to continue", "Resume");
  } else if (state === "pause") {
    state = "play";
    hideOverlay();
  }
}

// Update
function update(dt) {
  if (state !== "play") return;

  distance += dt * 10;

  ball.vy += GRAVITY * dt;
  ball.y += ball.vy * dt;

  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = 0;
  }

  if (ball.y + ball.r > H) {
    gameOver("Fell down");
    return;
  }

  const difficulty = 1 + Math.min(1.6, distance / 250);
  const scrollSpeed = 260 * difficulty;

  coinSpawnT -= dt;
  if (coinSpawnT <= 0) {
    spawnCoin();
    coinSpawnT = (1.1 + Math.random() * 0.7) / difficulty;
  }

  enemySpawnT -= dt;
  if (enemySpawnT <= 0) {
    spawnEnemy();
    enemySpawnT = (1.15 + Math.random() * 0.85) / difficulty;
  }

  for (const c of coins) {
    c.x -= scrollSpeed * dt;
    c.wobble += dt * 6;
    const wob = Math.sin(c.wobble) * 1.3;

    if (!c.collected && circleCircleHit(ball.x, ball.y, ball.r, c.x, c.y + wob, c.r)) {
      c.collected = true;
      coinsCollected += 1;
    }
  }

  for (const e of enemies) {
    e.x -= (e.speed * difficulty) * dt;
    e.wobble += dt * 5;
    const wob = Math.sin(e.wobble) * 2;

    if (circleCircleHit(ball.x, ball.y, ball.r, e.x, e.y + wob, e.r)) {
      gameOver("Hit enemy");
      return;
    }
  }

  while (coins.length && (coins[0].collected || coins[0].x + coins[0].r < -80)) coins.shift();
  while (enemies.length && (enemies[0].x + enemies[0].r < -120)) enemies.shift();

  for (const cl of clouds) {
    cl.x -= cl.speed * dt;
    if (cl.x < -220) {
      cl.x = W + 220;
      cl.y = 50 + Math.random() * (H * 0.35);
    }
  }

  starT += dt;
  if (starT > 0.05) {
    starT = 0;
    for (const s of stars) {
      s.alpha += (Math.random() - 0.5) * 0.08 * s.tw;
      s.alpha = Math.max(0.06, Math.min(0.9, s.alpha));
    }
  }
}

// Draw
function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#1e2a78");
  g.addColorStop(1, "#0b1020");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  for (const s of stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const c of clouds) {
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
    ctx.arc(c.x + c.size * 0.85, c.y + 10, c.size * 0.75, 0, Math.PI * 2);
    ctx.arc(c.x - c.size * 0.85, c.y + 10, c.size * 0.75, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, H - 36, W, 36);
}

function drawCoins() {
  for (const c of coins) {
    if (c.collected) continue;
    const wob = Math.sin(c.wobble) * 1.3;

    ctx.fillStyle = "rgba(255, 208, 64, 0.95)";
    ctx.beginPath();
    ctx.arc(c.x, c.y + wob, c.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.beginPath();
    ctx.arc(c.x - 3, c.y - 3 + wob, c.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEnemies() {
  for (const e of enemies) {
    const wob = Math.sin(e.wobble) * 2;

    ctx.fillStyle = "rgba(255,80,120,0.95)";
    ctx.beginPath();
    ctx.arc(e.x, e.y + wob, e.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(e.x, e.y + wob, e.r + 4, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawBall() {
  ctx.fillStyle = "#f2f2f2";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.beginPath();
  ctx.arc(ball.x + 5, ball.y - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  resizeCanvasToDisplaySize();
  if (W <= 1 || H <= 1) return;

  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawCoins();
  drawEnemies();
  drawBall();

  uiScore.textContent = String(Math.floor(distance));
  uiCoins.textContent = String(coinsCollected);
  uiBest.textContent = String(bestDistance);
}

// Loop
function loop(t) {
  const time = t / 1000;
  const dt = Math.min(0.033, (time - lastT) || 0);
  lastT = time;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// UI events
btnStart.addEventListener("click", () => {
  if (state === "pause") { state = "play"; hideOverlay(); return; }
  if (state === "menu") return startFromUI();
  if (state === "over") return reset();
  startFromUI();
});

btnBoard.addEventListener("click", openLeaderboard);
btnClose.addEventListener("click", closeLeaderboard);
modal.addEventListener("pointerdown", (e) => { if (e.target === modal) closeLeaderboard(); });

btnPause.addEventListener("click", () => {
  if (state === "menu" || state === "over") return;
  togglePause();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (state === "pause") { state = "play"; hideOverlay(); return; }
    flap();
  }
  if (e.code === "KeyR") {
    if (state === "menu") startFromUI();
    else reset();
  }
  if (e.code === "KeyP") {
    if (state !== "menu" && state !== "over") togglePause();
  }
});

canvas.addEventListener("pointerdown", () => {
  if (!modal.classList.contains("hidden")) return;
  flap();
});

// ✅ IMPORTANT: first resize AFTER layout, then start loop
requestAnimationFrame(() => {
  resizeCanvasToDisplaySize();
  ball.x = Math.max(120, Math.floor(W * 0.25));
  ball.y = Math.floor(H * 0.4);
  rebuildBackground();
  showOverlay("Flappy Distance + Coins", "Tap / Space to flap • Enemy touch = game over • Fall = game over", "Start");
  state = "menu";
  requestAnimationFrame(loop);
});
