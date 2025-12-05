const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let WIDTH, HEIGHT;
function resizeCanvas() {
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ---------------------
// SPELVARIABLER
// ---------------------
let p1Name = "";
let p2Name = "";
let themeColor = "#4ade80";
let difficulty = "easy";
let gameRunning = false;

let paddleWidth = 20;
let paddleHeight = 120;

let p1 = { x: 20, y: 0, score: 0 };
let p2 = { x: 0, y: 0, score: 0 };

let ball = { x: 0, y: 0, radius: 15, dx: 6, dy: 6 };

// ---------------------
// Ljud
// ---------------------
let soundPing = new Audio("pingpong.wav");
let soundMiss = new Audio("miss.wav");
let soundGameOver = new Audio("gameover.wav");

// ---------------------
// TOUCH Kontroll
// ---------------------
let touchP1 = null;
let touchP2 = null;

canvas.addEventListener("touchstart", e => {
    [...e.changedTouches].forEach(t => {
        if (t.clientX < WIDTH / 2) touchP1 = t;
        else touchP2 = t;
    });
});

canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    [...e.changedTouches].forEach(t => {
        if (touchP1 && t.identifier === touchP1.identifier) {
            p1.y = t.clientY - paddleHeight / 2;
        }
        if (touchP2 && t.identifier === touchP2.identifier) {
            p2.y = t.clientY - paddleHeight / 2;
        }
    });
}, { passive: false });

canvas.addEventListener("touchend", e => {
    [...e.changedTouches].forEach(t => {
        if (touchP1 && t.identifier === touchP1.identifier) touchP1 = null;
        if (touchP2 && t.identifier === touchP2.identifier) touchP2 = null;
    });
});

// ---------------------
// Starta spelet
// ---------------------
function startGame() {
    p1Name = document.getElementById("p1name").value || "Player 1";
    p2Name = document.getElementById("p2name").value || "Player 2";

    difficulty = document.getElementById("difficulty").value;

    let colors = document.querySelectorAll(".colorBox");
    colors.forEach(c => c.addEventListener("click", () => {
        themeColor = c.dataset.color;
    }));

    document.getElementById("startScreen").style.display = "none";

    resetPositions();
    gameRunning = true;
    gameLoop();
}

// ---------------------
function resetPositions() {
    p1.y = HEIGHT / 2 - paddleHeight / 2;
    p2.y = HEIGHT / 2 - paddleHeight / 2;
    p2.x = WIDTH - 40;

    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;

    let speed = difficulty === "easy" ? 6 :
                difficulty === "medium" ? 8 : 11;

    ball.dx = speed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = speed * (Math.random() > 0.5 ? 1 : -1);
}

// ---------------------
// GAME LOOP
// ---------------------
function gameLoop() {
    if (!gameRunning) return;

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Väggar
    if (ball.y < 0 || ball.y > HEIGHT) ball.dy *= -1;

    // Paddelträffar
    if (
        ball.x - ball.radius < p1.x + paddleWidth &&
        ball.y > p1.y &&
        ball.y < p1.y + paddleHeight
    ) {
        ball.dx *= -1;
        soundPing.play();
    }

    if (
        ball.x + ball.radius > p2.x &&
        ball.y > p2.y &&
        ball.y < p2.y + paddleHeight
    ) {
        ball.dx *= -1;
        soundPing.play();
    }

    // MISS
    if (ball.x < 0) {
        p2.score++;
        soundMiss.play();
        resetPositions();
    }

    if (ball.x > WIDTH) {
        p1.score++;
        soundMiss.play();
        resetPositions();
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // mittlinje
    ctx.fillStyle = "#333";
    for (let y = 0; y < HEIGHT; y += 40) {
        ctx.fillRect(WIDTH / 2 - 3, y, 6, 20);
    }

    // paddlar
    ctx.fillStyle = themeColor;
    ctx.fillRect(p1.x, p1.y, paddleWidth, paddleHeight);
    ctx.fillRect(p2.x, p2.y, paddleWidth, paddleHeight);

    // boll (rund!)
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // poäng
    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText(`${p1Name}: ${p1.score}`, 40, 40);
    ctx.fillText(`${p2Name}: ${p2.score}`, WIDTH - 200, 40);
}
