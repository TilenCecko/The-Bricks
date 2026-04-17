var x = 150;
var y = 200;
var dx = 2;
var dy = 4;
var WIDTH;
var HEIGHT;
var r = 10;
var f = 0;
var ctx;
var intervalId;
var timerId;
var level = 1;

var paddlecolor = "#000000";
var ballcolor = "#fb8500";
var brickcolors = {
    1: "#7cc576",
    2: "#f5a623",
    3: "#d64541"
};

var start = true;
var tocke;
var sekunde;
var izpisTimer;

var paddlex;
var paddleh;
var paddlew;

var rightDown = false;
var leftDown = false;

var bricks;
var NROWS;
var NCOLS;
var BRICKWIDTH;
var BRICKHEIGHT;
var PADDING;

var gameWon = false;
var isPaused = true;
var playerName = "";
var playerNamePromise = null;

function updateLevelDisplay() {
    $("#level").html(level);
}

function resetBall() {
    x = 350;
    y = 500;
    dx = 0;
    dy = 4;
    start = true;
}

function init() {
    ctx = $("#canvas")[0].getContext("2d");
    WIDTH = $("#canvas").width();
    HEIGHT = $("#canvas").height();

    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);

    $("#cas-box").off("click").on("click", showCredits);

    resetBall();
    init_paddle();
    initbricks();

    sekunde = 0;
    izpisTimer = "00:00";
    tocke = 0;

    updateLevelDisplay();
    $("#cas").html(izpisTimer);
    $("#tocke").html(tocke);

    drawScene();
    updatePauseButton();
    ensurePlayerName();
}

function ensurePlayerName() {
    playerNamePromise = Swal.fire({
        title: 'Vpiši uporabniško ime',
        input: 'text',
        inputLabel: 'Brez tega ne moreš začeti igre.',
        inputPlaceholder: 'npr. Tilen',
        confirmButtonText: 'Shrani',
        allowOutsideClick: false,
        allowEscapeKey: false,
        inputValidator: function (value) {
            if (!value || !value.trim()) {
                return 'Vpiši uporabniško ime.';
            }
        }
    }).then(function (result) {
        playerName = result.value.trim();
        localStorage.setItem("bricksCurrentPlayer", playerName);
        playerNamePromise = null;
        return playerName;
    });

    return playerNamePromise;
}

function init_paddle() {
    paddlex = WIDTH / 2.5;
    paddleh = 10;

    if(level==1){
        paddlew = 150;
    }else if(level==2){
        paddlew = 100;
    }else if(level==3){
        paddlew = 50;
    }else{
        paddlew = 150;
    }
}

function initbricks() {
    if(level==1){
        NROWS = 4;
        NCOLS = 8;
    }else if(level==2){
        NROWS = 6;
        NCOLS = 10;
    }else if(level==3){
        NROWS = 5;
        NCOLS = 10;
    }else{
        NROWS = 2;
        NCOLS = 2;
    }

    PADDING = 5;
    BRICKWIDTH = (WIDTH - (PADDING * (NCOLS - 1))) / NCOLS;
    BRICKHEIGHT = 30;

    bricks = new Array(NROWS);

    for (var i = 0; i < NROWS; i++) {
        bricks[i] = new Array(NCOLS);
        for (var j = 0; j < NCOLS; j++) {
            bricks[i][j] = Math.floor(Math.random() * 3) + 1;
        }
    }
}

function circle(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

function rect(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function allBricksDestroyed() {
    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
                return false;
            }
        }
    }
    return true;
}

function timer() {
    if (start == true) {
        sekunde++;
        let sekundeI = (sekunde % 60).toString().padStart(2, "0");
        let minuteI = Math.floor(sekunde / 60).toString().padStart(2, "0");
        izpisTimer = minuteI + ":" + sekundeI;
        $("#cas").html(izpisTimer);
    }
}

function onKeyDown(evt) {
    if (evt.keyCode == 39) rightDown = true;
    else if (evt.keyCode == 37) leftDown = true;
}

function onKeyUp(evt) {
    if (evt.keyCode == 39) rightDown = false;
    else if (evt.keyCode == 37) leftDown = false;
}

function preveriZmago() {
    if (!gameWon && allBricksDestroyed()) {
        gameWon = true;

        clearInterval(timerId);
        clearInterval(intervalId);

        Swal.fire({
            title: 'Bravo!',
            text: 'Koncal si level ' + level,
            icon: 'success'
        }).then(function () {

            if(level >= 3){
                saveScore(tocke);
                showLeaderboard();
                return;
            }

            level++;
            gameWon = false;
            updateLevelDisplay();

            resetBall();
            init_paddle();
            initbricks();

            isPaused = true;
            drawScene();
            updatePauseButton();
        });
    }
}

function drawScene() {
    clear();

    ctx.fillStyle = ballcolor;
    circle(x, y, 10);

    if (rightDown && (paddlex + paddlew) < WIDTH) paddlex += 5;
    else if (leftDown && paddlex > 0) paddlex -= 5;

    ctx.fillStyle = paddlecolor;
    rect(paddlex, HEIGHT - paddleh, paddlew, paddleh);

    for (var i = 0; i < NROWS; i++) {
        for (var j = 0; j < NCOLS; j++) {
            if (bricks[i][j] > 0) {
                ctx.fillStyle = brickcolors[bricks[i][j]];
                rect(
                    j * (BRICKWIDTH + PADDING) + PADDING,
                    i * (BRICKHEIGHT + PADDING) + PADDING,
                    BRICKWIDTH,
                    BRICKHEIGHT
                );
            }
        }
    }
}

function draw() {
    drawScene();

    var rowheight = BRICKHEIGHT + PADDING + f / 2 + r/2;
    var colwidth = BRICKWIDTH + PADDING + f / 2 + r/2;

    var row = Math.floor(y / rowheight);
    var col = Math.floor(x / colwidth);

    if (y < NROWS * rowheight && row >= 0 && col >= 0 && col < NCOLS && bricks[row][col] > 0) {
        dy = -dy;
        bricks[row][col]--;
        tocke++;
        $("#tocke").html(tocke);
        preveriZmago();
    }

    if (x + dx > WIDTH - r || x + dx < r) dx = -dx;

    if (y + dy < r) dy = -dy;
    else if (y + dy > HEIGHT - (r + f)) {
        start = false;

        if (x > paddlex && x < paddlex + paddlew) {
            dx = 8 * ((x - (paddlex + paddlew / 2)) / paddlew);
            dy = -dy;
            start = true;
        } else if (y + dy > HEIGHT - r) {

            clearInterval(timerId);
            clearInterval(intervalId);

            saveScore(tocke);
            showLeaderboard();

            timerId = null;
            intervalId = null;
            isPaused = true;
            updatePauseButton();
        }
    }

    x += dx;
    y += dy;
}

async function startGame() {
    await ensurePlayerName();

    if (intervalId) return;

    if (dx === 0) dx = 2;

    start = true;
    isPaused = false;

    intervalId = setInterval(draw, 10);
    timerId = setInterval(timer, 1000);

    updatePauseButton();
}

function togglePause() {
    if (!intervalId) return startGame();

    clearInterval(intervalId);
    clearInterval(timerId);

    intervalId = null;
    timerId = null;
    isPaused = true;

    updatePauseButton();
}

function resetGame() {
    clearInterval(intervalId);
    clearInterval(timerId);

    level = 1;
    sekunde = 0;
    tocke = 0;

    gameWon = false;
    isPaused = true;

    resetBall();
    init_paddle();
    initbricks();

    updateLevelDisplay();
    $("#cas").html("00:00");
    $("#tocke").html(tocke);

    drawScene();
    updatePauseButton();
}

function navodila(){
    Swal.fire({
        title: 'Navodila',
        html: `
            <ul style="text-align: left;"> 
            <li>Uporabi <b>puščice levo/desno</b> za premikanje paddla.</li> 
            <li>Imaš <b>3 levele</b>, vsak je težji.</li> 
            <li>Nekateri bloki so <b>druge barve</b> in jih moraš zadeti večkrat, da se uničijo.</li> 
            <li>Cilj je uničiti vse bloke.</li> 
            </ul>
        `,
        icon: 'info', 
        confirmButtonText: 'V redu'
    });
}

function showCredits() {
    Swal.fire({
        title: 'Avtor',
        text: 'Tilen Čečko'
    });
}

function saveScore(score) {
    let scores = JSON.parse(localStorage.getItem("bricksScores")) || [];
    let ime = playerName || localStorage.getItem("bricksCurrentPlayer") || "Igralec";

    scores.push({ name: ime, score: score });
    scores.sort((a, b) => b.score - a.score);
    scores = scores.slice(0, 5);

    localStorage.setItem("bricksScores", JSON.stringify(scores));
}

function lestvica() {
    let scores = JSON.parse(localStorage.getItem("bricksScores")) || [];

    let html = "<ol style='text-align:left'>";
    scores.forEach(s => {
        html += `<li>${s.name} - ${s.score}</li>`;
    });
    html += "</ol>";

    Swal.fire({
        title: '🏆 Lestvica',
        html: html
    });
}
function pocistiLestvico() {
    localStorage.removeItem("bricksScores");

    Swal.fire({
        title: 'Lestvica izbrisana!',
        icon: 'success'
    });
}
