const size = 24;
const cell = 22;
const stepTime = 135;
const directions = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const arrowKeys = new Map([
  ["ArrowUp", "up"],
  ["ArrowDown", "down"],
  ["ArrowLeft", "left"],
  ["ArrowRight", "right"],
]);

const board = document.querySelector("#board");
const context = board.getContext("2d");
const machine = document.querySelector(".machine");
const status = document.querySelector("#status");
const scoreDisplay = document.querySelector("#score");
const bestDisplay = document.querySelector("#best");
const startButton = document.querySelector("#start");
const result = document.querySelector("#result");
const resultTitle = document.querySelector("#result-title");
const resultDetail = document.querySelector("#result-detail");
const storageKey = "snake-arcade-high-score";

let best = 0;
try {
  const saved = Number(localStorage.getItem(storageKey));
  if (Number.isInteger(saved) && saved > 0 && saved <= size * size - 6) best = saved;
} catch {
  // The game can still keep a high score for this page session.
}

let snake;
let food;
let direction;
let turns;
let score;
let timer;
let state;
let swipe;

function resetRound() {
  snake = [
    { x: 11, y: 11 }, { x: 10, y: 11 }, { x: 9, y: 11 },
    { x: 9, y: 12 }, { x: 9, y: 13 }, { x: 8, y: 13 },
  ];
  direction = directions.right;
  turns = [];
  swipe = null;
  food = { x: 16, y: 11 };
  score = 0;
  updateScore();
}

function updateScore() {
  scoreDisplay.value = score;
  if (score > best) {
    best = score;
    try {
      localStorage.setItem(storageKey, String(best));
    } catch {
      // Storage may be disabled.
    }
  }
  bestDisplay.value = best;
}

function setState(nextState, message) {
  state = nextState;
  machine.dataset.state = state;
  status.textContent = message;
  startButton.disabled = state === "playing";
}

function startRound() {
  clearInterval(timer);
  resetRound();
  result.hidden = true;
  setState("playing", "进行中");
  draw();
  timer = setInterval(step, stepTime);
}

function endRound(won, reason) {
  clearInterval(timer);
  swipe = null;
  const title = won ? "你赢了！" : "游戏结束";
  setState(won ? "won" : "lost", title);
  resultTitle.textContent = title;
  resultDetail.textContent = reason + " · 得分 " + score;
  result.hidden = false;
}

function samePosition(first, second) {
  return first.x === second.x && first.y === second.y;
}

function nextFood() {
  const occupied = new Set(snake.map(({ x, y }) => y * size + x));
  const empty = [];
  for (let index = 0; index < size * size; index++) {
    if (!occupied.has(index)) empty.push(index);
  }
  if (!empty.length) return null;
  const index = empty[Math.floor(Math.random() * empty.length)];
  return { x: index % size, y: Math.floor(index / size) };
}

function step() {
  direction = turns.shift() ?? direction;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (head.x < 0 || head.x >= size || head.y < 0 || head.y >= size) {
    endRound(false, "撞到墙壁");
    return;
  }

  const eating = samePosition(head, food);
  // The tail leaves its current square on a step without food.
  if (snake.some((part, index) =>
    (eating || index < snake.length - 1) && samePosition(part, head))) {
    endRound(false, "撞到身体");
    return;
  }

  snake.unshift(head);
  if (eating) {
    score++;
    updateScore();
    food = nextFood();
  } else {
    snake.pop();
  }
  draw();

  if (!food) endRound(true, "填满棋盘");
}

function queueTurn(name) {
  if (state !== "playing" || turns.length >= 2) return;
  const next = directions[name];
  const previous = turns.at(-1) ?? direction;
  if (next.x * previous.x + next.y * previous.y === 0) turns.push(next);
}

function fillRounded(x, y, width, height, radius, color) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = color;
  context.fill();
}

function draw() {
  context.fillStyle = "#120e20";
  context.fillRect(0, 0, board.width, board.height);
  context.strokeStyle = "#251c35";
  context.lineWidth = 1;
  context.beginPath();
  for (let coordinate = cell; coordinate < board.width; coordinate += cell) {
    context.moveTo(coordinate + 0.5, 0);
    context.lineTo(coordinate + 0.5, board.height);
    context.moveTo(0, coordinate + 0.5);
    context.lineTo(board.width, coordinate + 0.5);
  }
  context.stroke();

  if (food) {
    const x = food.x * cell + cell / 2;
    const y = food.y * cell + cell / 2;
    context.save();
    context.shadowColor = "#ff7099";
    context.shadowBlur = 12;
    fillRounded(x - 6, y - 5, 12, 12, 5, "#ff8ba9");
    context.restore();
    fillRounded(x + 1, y - 9, 5, 3, 1.5, "#c9facb");
  }

  snake.forEach(({ x, y }, index) => {
    fillRounded(
      x * cell + 1, y * cell + 1, cell - 2, cell - 2, 5,
      index === 0 ? "#b9ffce" : `hsl(144 53% ${Math.max(44, 66 - index * 4)}%)`,
    );
  });
  const headX = (snake[0].x + 0.5) * cell + direction.x * 4;
  const headY = (snake[0].y + 0.5) * cell + direction.y * 4;
  for (const side of [-1, 1]) {
    fillRounded(headX + direction.y * side * 4 - 1.5,
      headY + direction.x * side * 4 - 1.5, 3, 3, 1.2, "#23352a");
  }
}

startButton.addEventListener("click", startRound);
document.querySelector("#restart").addEventListener("click", startRound);
document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("click", () => queueTurn(button.dataset.direction));
});
window.addEventListener("keydown", event => {
  const turn = arrowKeys.get(event.key);
  if (turn && state === "playing" && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    queueTurn(turn);
  }
});

board.addEventListener("pointerdown", event => {
  if (state !== "playing" || event.pointerType === "mouse" || !event.isPrimary) return;
  swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  board.setPointerCapture(event.pointerId);
});
board.addEventListener("pointermove", event => {
  if (swipe?.id !== event.pointerId) return;
  const dx = event.clientX - swipe.x;
  const dy = event.clientY - swipe.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;
  swipe = null;
  if (Math.abs(dx) > Math.abs(dy)) queueTurn(dx > 0 ? "right" : "left");
  else queueTurn(dy > 0 ? "down" : "up");
});
board.addEventListener("lostpointercapture", event => {
  if (swipe?.id === event.pointerId) swipe = null;
});

resetRound();
setState("ready", "待开始");
draw();
