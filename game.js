// -------------------------
// Mobilvänligt Pong Game
// -------------------------

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Ljud
const hitSound = new Audio("pingpong.mp3");
const missSound = new Audio("miss.mp3");
const gameOverSound = new Audio("gameover.mp3");

// Variabler
let p1 = { y: 0, score: 0, name: "Player 1" };
let p2 = { y: 0, score: 0, name: "Player 2" };
let ball = { x: 0, y: 0, vx: 0, vy: 0, size: 0 };
let paddleWidth = 0;
let paddleHeight = 0;

let gameRunning = false;
let themeColor = "white"; 
let winScore = 10;
let difficultyMultiplier = 1;

// Anpassar spelet till skärmen
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    paddleHeight = canvas.height * 0.18;
    paddleWidth = canvas.width * 0.02;
    ball.size = canvas.width * 0.02;

    p1.y = canvas.height / 2 - paddleHeight / 2;
    p2.y = canvas.height / 2 - paddleHeight / 2;
}
window.addEventListener("resize", resizeCanvas);

// Starta spelet
document.getElementById("startBtn").onclick = () => {
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";

    p1.name = document.getElementById("p1name").value || "Player 1";
    p2.name = document.getElementById("p2name").value || "Player 2";

    let theme = document.getElementById("theme").value;
    let difficulty = document.getElementById("difficulty").value;

    themeColor = {
        classic: "white",
        neon: "#39FF14",
        blue: "#4db8ff",
        pink: "#ff4da6",
        matrix: "#00ff00"
    }[theme];

    difficultyMultiplier = {
        easy: 1,
        medium: 1.4,
        hard: 1.9
    }[difficulty];

    resizeCanvas();
    startRound();
};

// Ny bollrunda
function startRound() {
    gameRunning = true;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;

    let speed = canvas.width * 0.004 * difficultyMultiplier;
    ball.vx = Math.random() > 0.5 ? speed : -speed;
    ball.vy = (Math.random() - 0.5) * speed;
}

// Rita allt
function draw() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = themeColor;
    ctx.fillStyle = themeColor;

    ctx.beginPath();
    ctx.setLineDash([10, 15]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillRect(30, p1.y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - 30 - paddleWidth, p2.y, paddleWidth, paddleHeight);

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = `${canvas.width * 0.06}px Arial`;
    ctx.fillText(p1.score, canvas.width * 0.35, canvas.height * 0.15);
    ctx.fillText(p2.score, canvas.width * 0.60, canvas.height * 0.15);
}

// Touch-kontroller
canvas.addEventListener("touchstart", handleTouch);
canvas.addEventListener("touchmove", handleTouch);

function handleTouch(e) {
    e.preventDefault();

    for (let t of e.touches) {
        if (t.clientX < canvas.width / 2) {
            if (t.clientY < canvas.height / 2) p1.y -= 40;
            else p1.y += 40;
        } else {
            if (t.clientY < canvas.height / 2) p2.y -= 40;
            else p2.y += 40;
        }
    }
}

// Mussa för dator
document.addEventListener("mousemove", (e) => {
    if (!gameRunning) return;
    if (e.clientX < canvas.width / 2) p1.y = e.clientY - paddleHeight / 2;
    else p2.y = e.clientY - paddleHeight / 2;
});

// Uppdatera spelet
function update() {
    if (!gameRunning) return;

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y < 0 || ball.y > canvas.height) ball.vy *= -1;

    // Vänster paddel
    if (ball.x - ball.size < 30 + paddleWidth &&
        ball.y > p1.y &&
        ball.y < p1.y + paddleHeight) {
        ball.vx *= -1;
        hitSound.play();
    }

    // Höger paddel
    if (ball.x + ball.size > canvas.width - 30 - paddleWidth &&
        ball.y > p2.y &&
        ball.y < p2.y + paddleHeight) {
        ball.vx *= -1;
        hitSound.play();
    }

    // Miss vänster
    if (ball.x < 0) {
        p2.score++;
        missSound.play();
        checkEnd();
        startRound();
    }

    // Miss höger
    if (ball.x > canvas.width) {
        p1.score++;
        missSound.play();
        checkEnd();
        startRound();
    }

    draw();
    requestAnimationFrame(update);
}

function checkEnd() {
    if (p1.score >= winScore || p2.score >= winScore) {
        gameRunning = false;
        gameOverSound.play();
        alert("Game Over! Tryck OK för att starta om.");
        location.reload();
    }
}

update();
