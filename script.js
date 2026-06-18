let board = [];

let rows = 9;
let cols = 9;
let totalMines = 10;

let flagsPlaced = 0;

let firstClick = true;

let gameOver = false;
let gameStarted = false;

let timer = 0;
let timerInterval = null;

/* Keyboard Navigation Variables */

let selectedRow = 0;
let selectedCol = 0;

/* HTML Elements */

const gameBoard = document.getElementById("gameBoard");

const mineCounter = document.getElementById("mineCounter");

const timerDisplay = document.getElementById("timer");

const statusDisplay = document.getElementById("gameStatus");

const messageBox = document.getElementById("messageBox");

const difficultySelect =
document.getElementById("difficultySelect");

const customRows =
document.getElementById("customRows");

const customCols =
document.getElementById("customCols");

const customMines =
document.getElementById("customMines");

const newGameBtn =
document.getElementById("newGameBtn");

const resetBtn =
document.getElementById("resetBtn");


/*  Cell Object Structure
   mine
   revealed
   flagged
   question
   number */

/* Update Mine Counter */

function updateMineCounter() {

    mineCounter.textContent =
        totalMines - flagsPlaced;
}

/* Timer Functions */

function startTimer() {

    if (gameStarted) {
        return;
    }

    gameStarted = true;

    timerInterval = setInterval(function () {

        timer++;

        timerDisplay.textContent = timer;

    }, 1000);
}

function stopTimer() {

    clearInterval(timerInterval);

}

function resetTimer() {

    clearInterval(timerInterval);

    timer = 0;

    timerDisplay.textContent = "0";

    gameStarted = false;
}

/*  Difficulty Selection */

function loadDifficulty() {

    let level = difficultySelect.value;

    if (level === "easy") {

        rows = 9;
        cols = 9;
        totalMines = 10;
    }

    else if (level === "medium") {

        rows = 16;
        cols = 16;
        totalMines = 40;
    }

    else if (level === "hard") {

        rows = 16;
        cols = 30;
        totalMines = 99;
    }

    else if (level === "custom") {

        rows = parseInt(customRows.value);

        cols = parseInt(customCols.value);

        totalMines =
            parseInt(customMines.value);

        if (rows < 5) rows = 5;
        if (cols < 5) cols = 5;

        let maxAllowed =
            (rows * cols) - 9;

        if (totalMines > maxAllowed) {

            totalMines = maxAllowed;
        }
    }
}

/* Create Empty Board Data */

function createEmptyBoard() {

    board = [];

    for (let r = 0; r < rows; r++) {

        let rowArray = [];

        for (let c = 0; c < cols; c++) {

            rowArray.push({

                mine: false,

                revealed: false,

                flagged: false,

                question: false,

                number: 0

            });
        }

        board.push(rowArray);
    }
}

/* Create Board UI */

function createBoardUI() {

    gameBoard.innerHTML = "";

    gameBoard.style.gridTemplateColumns =
        `repeat(${cols}, var(--cell-size))`;

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            let cell =
                document.createElement("div");

            cell.classList.add("cell");

            cell.dataset.row = r;
            cell.dataset.col = c;

            gameBoard.appendChild(cell);
        }
    }
}

/* Safe First Click Mine Placement */

function placeMinesSafe(firstRow, firstCol) {

    let minesPlaced = 0;

    while (minesPlaced < totalMines) {

        let randomRow =
            Math.floor(Math.random() * rows);

        let randomCol =
            Math.floor(Math.random() * cols);

        let safeZone =

            Math.abs(randomRow - firstRow) <= 1
            &&
            Math.abs(randomCol - firstCol) <= 1;

        if (
            !board[randomRow][randomCol].mine
            &&
            !safeZone
        ) {

            board[randomRow][randomCol].mine = true;

            minesPlaced++;
        }
    }

    calculateNumbers();
}

/* Calculate Adjacent Numbers */

function calculateNumbers() {

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (board[r][c].mine) {

                continue;
            }

            let count = 0;

            for (let dr = -1; dr <= 1; dr++) {

                for (let dc = -1; dc <= 1; dc++) {

                    let newRow = r + dr;

                    let newCol = c + dc;

                    if (
                        newRow >= 0 &&
                        newRow < rows &&
                        newCol >= 0 &&
                        newCol < cols
                    ) {

                        if (
                            board[newRow][newCol].mine
                        ) {
                            count++;
                        }
                    }
                }
            }

            board[r][c].number = count;
        }
    }
}

/* Reset Game */

function resetGame() {

    firstClick = true;

    gameOver = false;

    flagsPlaced = 0;

    selectedRow = 0;

    selectedCol = 0;

    resetTimer();

    updateMineCounter();

    statusDisplay.textContent =
        "Ready";

    messageBox.textContent =
        "Good Luck!";

    createEmptyBoard();

    createBoardUI();

    renderBoard();

    refreshBoardEvents();

    showReadyMessage();

    updateSelectedCell();
}

/*  New Game Button */

newGameBtn.addEventListener(
    "click",
    function () {

        loadDifficulty();

        resetGame();
    }
);

/* Reset Button */

resetBtn.addEventListener(
    "click",
    function () {

        resetGame();
    }
);

/* Start Game */

loadDifficulty();

resetGame();

/* =====================================================
   PART 2
   Reveal Cells, Flags, Question Marks
   Flood Fill Algorithm
   ===================================================== */

/* Get Cell Element */

function getCellElement(row, col) {

    return document.querySelector(
        `[data-row="${row}"][data-col="${col}"]`
    );
}

/* Render Single Cell */

function renderCell(row, col) {

    let cellData = board[row][col];

    let cell =
        getCellElement(row, col);

    if (!cell) {
        return;
    }

    cell.className = "cell";

    if (cellData.revealed) {

        cell.classList.add("revealed");

        if (cellData.mine) {

            cell.classList.add("mine");

            cell.innerHTML = "💣";
        }

        else {

            if (cellData.number > 0) {

                cell.textContent =
                    cellData.number;

                cell.classList.add(
                    "num" + cellData.number
                );
            }

            else {

                cell.textContent = "";
            }
        }
    }

    else {

        if (cellData.flagged) {

            cell.textContent = "🚩";

            cell.classList.add("flagged");
        }

        else if (cellData.question) {

            cell.textContent = "?";

            cell.classList.add("question");
        }

        else {

            cell.textContent = "";
        }
    }
}

/* Render Entire Board */

function renderBoard() {

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            renderCell(r, c);
        }
    }
}

/* Question Mark Mode-Right Click Logic*/

function toggleFlag(row, col) {

    if (gameOver) {
        return;
    }

    let cell = board[row][col];

    if (cell.revealed) {
        return;
    }

    if (
        !cell.flagged &&
        !cell.question
    ) {

        cell.flagged = true;

        flagsPlaced++;
    }

    else if (
        cell.flagged
    ) {

        cell.flagged = false;

        cell.question = true;

        flagsPlaced--;
    }

    else {

        cell.question = false;
    }

    updateMineCounter();

    renderCell(row, col);
}

/* Flood Fill Algorithm */

function floodFill(startRow, startCol) {

    let queue = [];

    queue.push([startRow, startCol]);

    while (queue.length > 0) {

        let current =
            queue.shift();

        let row = current[0];

        let col = current[1];

        if (
            row < 0 ||
            row >= rows ||
            col < 0 ||
            col >= cols
        ) {
            continue;
        }

        let currentCell =
            board[row][col];

        if (
            currentCell.revealed
        ) {
            continue;
        }

        if (
            currentCell.flagged
        ) {
            continue;
        }

        currentCell.revealed = true;

        renderCell(row, col);

        if (
            currentCell.number !== 0
        ) {
            continue;
        }

        for (
            let dr = -1;
            dr <= 1;
            dr++
        ) {

            for (
                let dc = -1;
                dc <= 1;
                dc++
            ) {

                if (
                    dr === 0 &&
                    dc === 0
                ) {
                    continue;
                }

                queue.push([
                    row + dr,
                    col + dc
                ]);
            }
        }
    }
}

/* Reveal Cell */

function revealCell(row, col) {

    if (gameOver) {
        return;
    }

    let cell =
        board[row][col];

    if (
        cell.revealed ||
        cell.flagged
    ) {
        return;
    }

    /* Safe First Click */

    if (firstClick) {

        placeMinesSafe(
            row,
            col
        );

        firstClick = false;

        startTimer();
    }

    if (cell.mine) {

        loseGame();

        return;
    }

    if (
        cell.number === 0
    ) {

        floodFill(
            row,
            col
        );
    }

    else {

        cell.revealed = true;

        renderCell(
            row,
            col
        );
    }

    checkWin();
}

/* Board Click Events */

function attachBoardEvents() {

    let allCells =
        document.querySelectorAll(".cell");

    allCells.forEach(function (cell) {

        cell.addEventListener(
            "click",
            function () {

                let row =
                    parseInt(
                        this.dataset.row
                    );

                let col =
                    parseInt(
                        this.dataset.col
                    );

                revealCell(
                    row,
                    col
                );
            }
        );

        cell.addEventListener(
            "contextmenu",
            function (event) {

                event.preventDefault();

                let row =
                    parseInt(
                        this.dataset.row
                    );

                let col =
                    parseInt(
                        this.dataset.col
                    );

                toggleFlag(
                    row,
                    col
                );
            }
        );
    });
}

   /* =====================================================
   PART 3
   Win / Loss Logic
   Chord Action
   Mine Reveal
   Explosion Animation
   ===================================================== */

/* Chord Action */

function chordReveal(row, col) {

    let currentCell = board[row][col];

    if (!currentCell.revealed) {
        return;
    }

    if (currentCell.number === 0) {
        return;
    }

    let nearbyFlags = 0;

    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            let newRow = row + dr;
            let newCol = col + dc;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols
            ) {

                if (
                    board[newRow][newCol].flagged
                ) {

                    nearbyFlags++;
                }
            }
        }
    }

    if (
        nearbyFlags !== currentCell.number
    ) {

        return;
    }

    for (let dr = -1; dr <= 1; dr++) {

        for (let dc = -1; dc <= 1; dc++) {

            let newRow = row + dr;
            let newCol = col + dc;

            if (
                newRow >= 0 &&
                newRow < rows &&
                newCol >= 0 &&
                newCol < cols
            ) {

                if (
                    !board[newRow][newCol].flagged
                ) {

                    revealCell(
                        newRow,
                        newCol
                    );
                }
            }
        }
    }
}

/* Double Click Support */

function attachChordEvents() {

    let allCells =
        document.querySelectorAll(".cell");

    allCells.forEach(function (cell) {

        cell.addEventListener(
            "dblclick",
            function () {

                let row =
                    parseInt(
                        this.dataset.row
                    );

                let col =
                    parseInt(
                        this.dataset.col
                    );

                chordReveal(
                    row,
                    col
                );
            }
        );
    });
}

/* Reveal All Mines */

function revealAllMines() {

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (
                board[r][c].mine
            ) {

                board[r][c].revealed = true;

                renderCell(r, c);
            }
        }
    }
}

/* Sequential Explosion Animation */

function animateMineExplosion() {

    let delay = 0;

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (
                board[r][c].mine
            ) {

                setTimeout(function () {

                    board[r][c].revealed = true;

                    renderCell(r, c);

                }, delay);

                delay += 40;
            }
        }
    }
}

/* Lose Game */

function loseGame() {

    gameOver = true;

    stopTimer();

    statusDisplay.textContent =
        "Game Over";

    messageBox.textContent =
        "💥 You Hit A Mine!";

    messageBox.classList.remove(
        "win-text"
    );

    messageBox.classList.add(
        "lose-text"
    );

    animateMineExplosion();

    updateStatistics(false);
}

/*Check Win Condition*/

function checkWin() {

    let revealedCount = 0;

    let safeCells =
        (rows * cols) - totalMines;

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (
                board[r][c].revealed
                &&
                !board[r][c].mine
            ) {

                revealedCount++;
            }
        }
    }

    if (
        revealedCount === safeCells
    ) {

        winGame();
    }
}

/* Win Game */

function winGame() {

    gameOver = true;

    stopTimer();

    statusDisplay.textContent =
        "Victory";

    messageBox.textContent =
        "🎉 You Cleared The Board!";

    messageBox.classList.remove(
        "lose-text"
    );

    messageBox.classList.add(
        "win-text"
    );

    autoFlagRemainingMines();

    updateStatistics(true);

    saveLeaderboardScore();
}

/* Auto Flag Mines On Win */

function autoFlagRemainingMines() {

    for (let r = 0; r < rows; r++) {

        for (let c = 0; c < cols; c++) {

            if (
                board[r][c].mine
            ) {

                board[r][c].flagged = true;

                renderCell(r, c);
            }
        }
    }
}

/* Update Board Events */

function refreshBoardEvents() {

    attachBoardEvents();

    attachChordEvents();
}

   /* =====================================================
   PART 4
   Statistics
   localStorage
   Leaderboard
   ===================================================== */

/* Statistics Elements */

const gamesPlayedText =
document.getElementById("gamesPlayed");

const gamesWonText =
document.getElementById("gamesWon");

const winRateText =
document.getElementById("winRate");

const resetStatsBtn =
document.getElementById("resetStatsBtn");

const leaderboardContainer =
document.getElementById("leaderboardContainer");

/*  Statistics Object */

let statistics = {

    gamesPlayed: 0,

    gamesWon: 0

};

/* Load Statistics */

function loadStatistics() {

    let savedStats =
        localStorage.getItem(
            "minesweeperStats"
        );

    if (savedStats) {

        statistics =
            JSON.parse(savedStats);
    }

    updateStatisticsDisplay();
}

/* Save Statistics */

function saveStatistics() {

    localStorage.setItem(
        "minesweeperStats",
        JSON.stringify(statistics)
    );
}

/*  Update Statistics */

function updateStatistics(playerWon) {

    statistics.gamesPlayed++;

    if (playerWon) {

        statistics.gamesWon++;
    }

    saveStatistics();

    updateStatisticsDisplay();
}

/* Display Statistics */

function updateStatisticsDisplay() {

    gamesPlayedText.textContent =
        statistics.gamesPlayed;

    gamesWonText.textContent =
        statistics.gamesWon;

    let winRate = 0;

    if (
        statistics.gamesPlayed > 0
    ) {

        winRate =
            (
                statistics.gamesWon /
                statistics.gamesPlayed
            ) * 100;
    }

    winRateText.textContent =
        winRate.toFixed(1) + "%";
}

/*  Reset Statistics */

function resetStatistics() {

    statistics.gamesPlayed = 0;

    statistics.gamesWon = 0;

    saveStatistics();

    updateStatisticsDisplay();
}

resetStatsBtn.addEventListener(
    "click",
    function () {

        let answer =
            confirm(
                "Reset all statistics?"
            );

        if (answer) {

            resetStatistics();
        }
    }
);

/* Leaderboard */

/*  Difficulty Key */

function getLeaderboardKey() {

    let difficulty =
        difficultySelect.value;

    return (
        "leaderboard_" +
        difficulty
    );
}

/* Get Scores */

function getLeaderboardScores() {

    let key =
        getLeaderboardKey();

    let scores =
        localStorage.getItem(key);

    if (!scores) {

        return [];
    }

    return JSON.parse(scores);
}

/* Save Scores */

function saveLeaderboardScores(scores) {

    let key =
        getLeaderboardKey();

    localStorage.setItem(
        key,
        JSON.stringify(scores)
    );
}

/* Save New Score */

function saveLeaderboardScore() {

    let scores =
        getLeaderboardScores();

    scores.push(timer);

    scores.sort(function(a, b) {

        return a - b;

    });

    if (scores.length > 3) {

        scores = scores.slice(0, 3);
    }

    saveLeaderboardScores(scores);

    updateLeaderboardDisplay();
}

/* Update Leaderboard */

function updateLeaderboardDisplay() {

    let scores =
        getLeaderboardScores();

    leaderboardContainer.innerHTML = "";

    if (scores.length === 0) {

        leaderboardContainer.innerHTML =
        `
        <div class="leaderboard-row">
            No records yet
        </div>
        `;

        return;
    }

    for (
        let i = 0;
        i < scores.length;
        i++
    ) {

        let row =
            document.createElement("div");

        row.classList.add(
            "leaderboard-row"
        );

        let medal = "";

        if (i === 0) {

            medal = "🥇";
        }

        else if (i === 1) {

            medal = "🥈";
        }

        else if (i === 2) {

            medal = "🥉";
        }

        row.innerHTML =
            medal +
            " " +
            scores[i] +
            " seconds";

        leaderboardContainer.appendChild(
            row
        );
    }
}

/* Refresh Leaderboard when Difficulty Changes */

difficultySelect.addEventListener(
    "change",
    function () {

        updateLeaderboardDisplay();
    }
);

/* Reset Leaderboard */

function resetLeaderboard() {

    localStorage.removeItem(
        getLeaderboardKey()
    );

    updateLeaderboardDisplay();
}

let resetLeaderboardBtn =
document.getElementById(
    "resetLeaderboardBtn"
);

if (resetLeaderboardBtn) {

    resetLeaderboardBtn.addEventListener(
        "click",
        function () {

            let answer =
                confirm(
                    "Reset leaderboard?"
                );

            if (answer) {

                resetLeaderboard();
            }
        }
    );
}

/* Load Everything On Startup */

loadStatistics();
updateLeaderboardDisplay();

/* =====================================================
   PART 5
   Dark Mode
   Themes
   Cell Size
   Keyboard Navigation
   Final Setup
   ===================================================== */


/* Theme Elements */

const themeToggle =
document.getElementById(
    "themeToggle"
);

const boardThemeSelect =
document.getElementById(
    "boardThemeSelect"
);

const cellSizeSelect =
document.getElementById(
    "cellSizeSelect"
);

/* Dark Mode */

function loadThemeSettings(){

    let savedMode =
        localStorage.getItem(
            "lightMode"
        );

    if(savedMode === "true"){

        document.body.classList.add(
            "light-mode"
        );

        themeToggle.checked = true;

    }
    else{

        document.body.classList.remove(
            "light-mode"
        );

        themeToggle.checked = false;

    }

}

themeToggle.addEventListener(
    "change",
    function(){

        if(themeToggle.checked){

            document.body.classList.add(
                "light-mode"
            );

        }
        else{

            document.body.classList.remove(
                "light-mode"
            );

        }
        localStorage.setItem(
            "lightMode",
            themeToggle.checked
        );
    }
);

/* Board Theme Selector */

boardThemeSelect.addEventListener(
    "change",
    function () {

        let selectedTheme =
            boardThemeSelect.value;

        applyBoardTheme(
            selectedTheme
        );

        localStorage.setItem(
            "boardTheme",
            selectedTheme
        );
    }
);

function applyBoardTheme(themeName) {

    document.body.classList.remove(
        "rose-theme"
    );

    document.body.classList.remove(
        "berry-theme"
    );

    if(themeName === "rose"){

        document.body.classList.add(
            "rose-theme"
        );

    }

    else if(themeName === "berry"){

        document.body.classList.add(
            "berry-theme"
        );
    }
}

/* Load Saved Theme */

function loadSavedBoardTheme() {

    let savedTheme =
        localStorage.getItem(
            "boardTheme"
        );

    if (savedTheme) {

        boardThemeSelect.value =
            savedTheme;

        applyBoardTheme(
            savedTheme
        );
    }
}

/* Cell Size Selector */

function applyCellSize(size) {

    document.body.classList.remove(
        "small-cells"
    );

    document.body.classList.remove(
        "medium-cells"
    );

    document.body.classList.remove(
        "large-cells"
    );

    if (size === "small") {

        document.body.classList.add(
            "small-cells"
        );
    }

    else if (
        size === "medium"
    ) {

        document.body.classList.add(
            "medium-cells"
        );
    }

    else {

        document.body.classList.add(
            "large-cells"
        );
    }
}

cellSizeSelect.addEventListener(
    "change",
    function () {

        let size =
            cellSizeSelect.value;

        applyCellSize(size);

        localStorage.setItem(
            "cellSize",
            size
        );
    }
);

/* Load Saved Cell Size */

function loadCellSize() {

    let savedSize =
        localStorage.getItem(
            "cellSize"
        );

    if (savedSize) {

        cellSizeSelect.value =
            savedSize;

        applyCellSize(
            savedSize
        );
    }
}

/* Keyboard Navigation */

function removeSelectionBox() {

    let selected =
        document.querySelector(
            ".selected-cell"
        );

    if (selected) {

        selected.classList.remove(
            "selected-cell"
        );
    }
}

/* Highlight Current Cell */

function updateSelectedCell() {

    removeSelectionBox();

    let currentCell =
        getCellElement(
            selectedRow,
            selectedCol
        );

    if (currentCell) {

        currentCell.classList.add(
            "selected-cell"
        );
    }
}

/* Arrow Keys */

document.addEventListener(
    "keydown",
    function(event) {

        if (gameOver) {

            return;
        }

        if (
            event.key === "ArrowUp"
        ) {

            selectedRow--;

            if (selectedRow < 0) {

                selectedRow = 0;
            }
        }

        else if (
            event.key === "ArrowDown"
        ) {

            selectedRow++;

            if (
                selectedRow >= rows
            ) {

                selectedRow = rows - 1;
            }
        }

        else if (
            event.key === "ArrowLeft"
        ) {

            selectedCol--;

            if (selectedCol < 0) {

                selectedCol = 0;
            }
        }

        else if (
            event.key === "ArrowRight"
        ) {

            selectedCol++;

            if (
                selectedCol >= cols
            ) {

                selectedCol = cols - 1;
            }
        }

        /*
           Enter Key
           Reveal Cell
        */

        else if (
            event.key === "Enter"
        ) {

            revealCell(
                selectedRow,
                selectedCol
            );
        }

        /*
           Space Key
           Flag Cell
           */

        else if (
            event.code === "Space"
        ) {

            event.preventDefault();

            toggleFlag(
                selectedRow,
                selectedCol
            );
        }

        updateSelectedCell();
    }
);

/* 
   BONUS FEATURE D
   Mouse Click Updates Selection
 */

function enableSelectionTracking() {

    let allCells =
        document.querySelectorAll(
            ".cell"
        );

    allCells.forEach(function(cell) {

        cell.addEventListener(
            "click",
            function() {

                selectedRow =
                    parseInt(
                        this.dataset.row
                    );

                selectedCol =
                    parseInt(
                        this.dataset.col
                    );

                updateSelectedCell();
            }
        );
    });
}

/* 
   Update refreshBoardEvents()
   Replace Old Version With This
 */

function refreshBoardEvents() {

    attachBoardEvents();

    attachChordEvents();

    enableSelectionTracking();

    updateSelectedCell();
}

/* Game Ready Status */

function showReadyMessage() {

    messageBox.classList.remove(
        "win-text"
    );

    messageBox.classList.remove(
        "lose-text"
    );

    messageBox.textContent =
        "Good Luck!";
}

/* =====================================================
   OPTIONAL
   Nice Status Messages
   ===================================================== */

function setGameStatus(text) {

    statusDisplay.textContent =
        text;
}

loadThemeSettings();

loadSavedBoardTheme();

loadCellSize();

updateSelectedCell();

console.log(
    "MineBlaster Loaded Successfully"
);

