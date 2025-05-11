class Player {
    constructor(scoreDisplay, historyDisplay, currentThrowDisplay) {
        this.score = 501;
        this.history = [];
        this.scoreDisplay = scoreDisplay;
        this.historyDisplay = historyDisplay;
        this.currentThrowDisplay = currentThrowDisplay;
        this.selectedNumber = null;
        this.currentMultiplier = 1;
        this.updateDisplay();
    }

    setNumber(number, multiplier) {
        this.selectedNumber = number;
        this.currentMultiplier = multiplier;
        this.updateCurrentThrowDisplay();
    }

    updateCurrentThrowDisplay() {
        if (this.selectedNumber === null) {
            this.currentThrowDisplay.textContent = '';
            return;
        }
        let multiplierText = '';
        switch (this.currentMultiplier) {
            case 1:
                multiplierText = 'Single'; break;
            case 2:
                multiplierText = 'Double'; break;
            case 3:
                multiplierText = 'Triple'; break;
        }
        this.currentThrowDisplay.textContent = `${multiplierText} ${this.selectedNumber} (${this.selectedNumber * this.currentMultiplier} points)`;
    }

    confirmThrow() {
        if (this.selectedNumber === null) {
            alert('Please select a number first!');
            return;
        }
        const points = this.selectedNumber * this.currentMultiplier;
        if (this.score - points < 0) {
            alert('Invalid score! Cannot go below 0.');
            return;
        }
        this.score -= points;
        this.history.push(points);
        this.selectedNumber = null;
        this.currentMultiplier = 1;
        this.updateDisplay();
        this.updateCurrentThrowDisplay();
    }

    undoLast() {
        if (this.history.length === 0) {
            alert('No moves to undo!');
            return;
        }
        this.score += this.history.pop();
        this.updateDisplay();
    }

    updateDisplay() {
        this.scoreDisplay.textContent = this.score;
        this.historyDisplay.textContent = this.history.join(' → ');
    }
}

function createNumberButtons(grid, onNumberClick) {
    grid.innerHTML = '';
    for (let i = 0; i <= 20; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.onclick = () => onNumberClick(i);
        grid.appendChild(button);
    }
}

function renderDartboardImageMap(onNumberClick) {
    const map = document.getElementById('dartboardmap');
    map.innerHTML = '';
    const cx = 260, cy = 260;
    const rDoubleOuter = 240, rDoubleInner = 225;
    const rTripleOuter = 155, rTripleInner = 140;
    const rOuterBull = 38, rBull = 13;
    const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const subdivisions = 40; // Maximum resolution

    for (let i = 0; i < 20; i++) {
        const angleStart = (i * 2 * Math.PI) / 20;
        const angleEnd = ((i + 1) * 2 * Math.PI) / 20;
        for (let j = 0; j < subdivisions; j++) {
            const a1 = angleStart + (j / subdivisions) * (angleEnd - angleStart);
            const a2 = angleStart + ((j + 1) / subdivisions) * (angleEnd - angleStart);

            // Double ring
            map.appendChild(makeAreaPolygon(cx, cy, rDoubleInner, rDoubleOuter, a1, a2, numbers[i], 2, onNumberClick));
            // Triple ring
            map.appendChild(makeAreaPolygon(cx, cy, rTripleInner, rTripleOuter, a1, a2, numbers[i], 3, onNumberClick));
            // Single outer
            map.appendChild(makeAreaPolygon(cx, cy, rDoubleInner, rTripleOuter, a1, a2, numbers[i], 1, onNumberClick));
            // Single inner
            map.appendChild(makeAreaPolygon(cx, cy, rTripleInner, rBull + rOuterBull, a1, a2, numbers[i], 1, onNumberClick));
        }
    }
    // Outer bull
    map.appendChild(makeAreaCircle(cx, cy, rOuterBull, 25, 1, onNumberClick));
    // Bullseye
    map.appendChild(makeAreaCircle(cx, cy, rBull, 50, 1, onNumberClick));
}

function makeAreaPolygon(cx, cy, r1, r2, angle1, angle2, number, multiplier, onClick) {
    // Approximate each segment as a quadrilateral
    const x1 = Math.round(cx + r1 * Math.sin(angle1));
    const y1 = Math.round(cy - r1 * Math.cos(angle1));
    const x2 = Math.round(cx + r2 * Math.sin(angle1));
    const y2 = Math.round(cy - r2 * Math.cos(angle1));
    const x3 = Math.round(cx + r2 * Math.sin(angle2));
    const y3 = Math.round(cy - r2 * Math.cos(angle2));
    const x4 = Math.round(cx + r1 * Math.sin(angle2));
    const y4 = Math.round(cy - r1 * Math.cos(angle2));
    const coords = [x1, y1, x2, y2, x3, y3, x4, y4].join(',');
    const area = document.createElement('area');
    area.shape = 'poly';
    area.coords = coords;
    area.href = '#';
    area.alt = `${number}x${multiplier}`;
    area.onclick = (e) => {
        e.preventDefault();
        onClick(number, multiplier);
    };
    return area;
}

function makeAreaCircle(cx, cy, r, number, multiplier, onClick) {
    const area = document.createElement('area');
    area.shape = 'circle';
    area.coords = [cx, cy, r].join(',');
    area.href = '#';
    area.alt = `${number}x${multiplier}`;
    area.onclick = (e) => {
        e.preventDefault();
        onClick(number, multiplier);
    };
    return area;
}

function overlayDebugSVG() {
    // These must match the values in renderDartboardImageMap
    const width = 520, height = 520, cx = 260, cy = 260;
    const rDoubleOuter = 240, rDoubleInner = 225;
    const rTripleOuter = 155, rTripleInner = 140;
    const rOuterBull = 38, rBull = 13;
    const numbers = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    const subdivisions = 40;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '10';

    for (let i = 0; i < 20; i++) {
        const angleStart = (i * 2 * Math.PI) / 20;
        const angleEnd = ((i + 1) * 2 * Math.PI) / 20;
        for (let j = 0; j < subdivisions; j++) {
            const a1 = angleStart + (j / subdivisions) * (angleEnd - angleStart);
            const a2 = angleStart + ((j + 1) / subdivisions) * (angleEnd - angleStart);
            // Double ring
            svg.appendChild(makeDebugPolygon(cx, cy, rDoubleInner, rDoubleOuter, a1, a2, 'rgba(255,0,0,0.2)'));
            // Triple ring
            svg.appendChild(makeDebugPolygon(cx, cy, rTripleInner, rTripleOuter, a1, a2, 'rgba(0,255,0,0.2)'));
            // Single outer
            svg.appendChild(makeDebugPolygon(cx, cy, rDoubleInner, rTripleOuter, a1, a2, 'rgba(0,0,255,0.1)'));
            // Single inner
            svg.appendChild(makeDebugPolygon(cx, cy, rTripleInner, rBull + rOuterBull, a1, a2, 'rgba(255,255,0,0.1)'));
        }
    }
    // Outer bull
    svg.appendChild(makeDebugCircle(cx, cy, rOuterBull, 'rgba(0,255,255,0.2)'));
    // Bullseye
    svg.appendChild(makeDebugCircle(cx, cy, rBull, 'rgba(255,0,255,0.2)'));

    // Place SVG overlay on top of the dartboard image
    const boardDiv = document.querySelector('.dartboard-center');
    svg.id = 'debug-dartboard-overlay';
    boardDiv.style.position = 'relative';
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    boardDiv.appendChild(svg);
}

function makeDebugPolygon(cx, cy, r1, r2, angle1, angle2, color) {
    const x1 = cx + r1 * Math.sin(angle1);
    const y1 = cy - r1 * Math.cos(angle1);
    const x2 = cx + r2 * Math.sin(angle1);
    const y2 = cy - r2 * Math.cos(angle1);
    const x3 = cx + r2 * Math.sin(angle2);
    const y3 = cy - r2 * Math.cos(angle2);
    const x4 = cx + r1 * Math.sin(angle2);
    const y4 = cy - r1 * Math.cos(angle2);
    const points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`;
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', points);
    polygon.setAttribute('fill', color);
    polygon.setAttribute('stroke', '#000');
    polygon.setAttribute('stroke-width', '0.5');
    return polygon;
}

function makeDebugCircle(cx, cy, r, color) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx);
    circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', '#000');
    circle.setAttribute('stroke-width', '0.5');
    return circle;
}

let selectedMultiplier = { 1: 1, 2: 1 };

function selectMultiplier(playerNum, multiplier) {
    // If already selected, unselect (return to Single)
    if (selectedMultiplier[playerNum] === multiplier) {
        selectedMultiplier[playerNum] = 1;
    } else {
        selectedMultiplier[playerNum] = multiplier;
    }
    // Highlight selected button
    const btns = document.querySelectorAll(`#multiplierButtons${playerNum} .multiplier`);
    btns.forEach(btn => {
        if (parseInt(btn.getAttribute('data-multiplier')) === selectedMultiplier[playerNum]) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    // Update number grid (for graying out 25)
    updateNumberGrid(playerNum);
}

function updateNumberGrid(playerNum) {
    const grid = document.getElementById(`numberGrid${playerNum}`);
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i <= 20; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = 'number-btn';
        btn.onclick = () => handleNumberClick(playerNum, i);
        grid.appendChild(btn);
    }
    // Add 25 button
    const btn25 = document.createElement('button');
    btn25.textContent = '25';
    btn25.className = 'number-btn';
    if (selectedMultiplier[playerNum] === 3) {
        btn25.classList.add('grayed');
        btn25.disabled = true;
    } else {
        btn25.onclick = () => handleNumberClick(playerNum, 25);
    }
    grid.appendChild(btn25);
}

function handleNumberClick(playerNum, number) {
    const player = playerNum === 1 ? window._player1 : window._player2;
    player.setNumber(number, selectedMultiplier[playerNum]);
    player.confirmThrow(); // Auto-confirm
}

// Multi-game management
let games = [];
let currentGameIndex = 0;

function createNewGame() {
    // Prompt for game and player names
    const gameName = prompt('Enter a name for this game:', `Game ${games.length + 1}`) || `Game ${games.length + 1}`;
    const player1Name = prompt('Enter Player 1 name:', 'Player 1') || 'Player 1';
    const player2Name = prompt('Enter Player 2 name:', 'Player 2') || 'Player 2';
    // Each game has its own player states and names
    return {
        gameName,
        player1Name,
        player2Name,
        player1: { score: 501, history: [] },
        player2: { score: 501, history: [] },
    };
}

function saveCurrentGameState() {
    if (games.length === 0) return;
    games[currentGameIndex].player1 = {
        score: window._player1.score,
        history: [...window._player1.history],
    };
    games[currentGameIndex].player2 = {
        score: window._player2.score,
        history: [...window._player2.history],
    };
}

function loadGameState(index) {
    if (index < 0 || index >= games.length) return;
    const g = games[index];
    window._player1.score = g.player1.score;
    window._player1.history = [...g.player1.history];
    window._player2.score = g.player2.score;
    window._player2.history = [...g.player2.history];
    window._player1.updateDisplay();
    window._player2.updateDisplay();
}

function updateGameSelectUI() {
    const select = document.getElementById('gameSelect');
    select.innerHTML = '';
    games.forEach((g, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = g.gameName || `Game ${i + 1}`;
        if (i === currentGameIndex) opt.selected = true;
        select.appendChild(opt);
    });
}

function saveGamesToStorage() {
    localStorage.setItem('dartCounterGames', JSON.stringify(games));
    localStorage.setItem('dartCounterCurrentGame', currentGameIndex);
}

function loadGamesFromStorage() {
    const gamesStr = localStorage.getItem('dartCounterGames');
    const idxStr = localStorage.getItem('dartCounterCurrentGame');
    if (gamesStr) {
        games = JSON.parse(gamesStr);
        currentGameIndex = idxStr ? parseInt(idxStr) : 0;
    }
}

let _player1, _player2;

function initPlayersAndUI(gameState) {
    // Remove old event handlers by replacing the elements
    document.getElementById('numberGrid1').innerHTML = '';
    document.getElementById('numberGrid2').innerHTML = '';
    // Create new Player objects
    _player1 = new Player(
        document.getElementById('score1'),
        document.getElementById('history1'),
        document.getElementById('currentThrow1')
    );
    _player2 = new Player(
        document.getElementById('score2'),
        document.getElementById('history2'),
        document.getElementById('currentThrow2')
    );
    window._player1 = _player1;
    window._player2 = _player2;
    // Restore state
    if (gameState) {
        _player1.score = gameState.player1.score;
        _player1.history = [...gameState.player1.history];
        _player2.score = gameState.player2.score;
        _player2.history = [...gameState.player2.history];
        _player1.updateDisplay();
        _player2.updateDisplay();
    }
    // Reset multipliers
    selectedMultiplier = { 1: 1, 2: 1 };
    selectMultiplier(1, 1);
    selectMultiplier(2, 1);
    // Update number grids
    updateNumberGrid(1);
    updateNumberGrid(2);
    // Patch Player's confirmThrow and undoLast to save state after each action
    const origConfirmThrow1 = _player1.confirmThrow.bind(_player1);
    _player1.confirmThrow = function () {
        origConfirmThrow1();
        saveCurrentGameState();
        saveGamesToStorage();
    };
    const origUndoLast1 = _player1.undoLast.bind(_player1);
    _player1.undoLast = function () {
        origUndoLast1();
        saveCurrentGameState();
        saveGamesToStorage();
    };
    const origConfirmThrow2 = _player2.confirmThrow.bind(_player2);
    _player2.confirmThrow = function () {
        origConfirmThrow2();
        saveCurrentGameState();
        saveGamesToStorage();
    };
    const origUndoLast2 = _player2.undoLast.bind(_player2);
    _player2.undoLast = function () {
        origUndoLast2();
        saveCurrentGameState();
        saveGamesToStorage();
    };
    // Set player names
    document.getElementById('player1Name').textContent = gameState.player1Name || 'Player 1';
    document.getElementById('player2Name').textContent = gameState.player2Name || 'Player 2';
}

document.addEventListener('DOMContentLoaded', () => {
    // Multi-game UI
    const newGameBtn = document.getElementById('newGameBtn');
    const gameSelect = document.getElementById('gameSelect');
    const deleteGameBtn = document.getElementById('deleteGameBtn');

    // Load from storage or start with one game
    loadGamesFromStorage();
    if (games.length === 0) {
        games.push(createNewGame());
        currentGameIndex = 0;
    }
    updateGameSelectUI();
    initPlayersAndUI(games[currentGameIndex]);

    newGameBtn.onclick = () => {
        saveCurrentGameState();
        games.push(createNewGame());
        currentGameIndex = games.length - 1;
        updateGameSelectUI();
        initPlayersAndUI(games[currentGameIndex]);
        saveGamesToStorage();
    };
    gameSelect.onchange = (e) => {
        saveCurrentGameState();
        currentGameIndex = parseInt(gameSelect.value);
        initPlayersAndUI(games[currentGameIndex]);
        saveGamesToStorage();
    };
    deleteGameBtn.onclick = () => {
        if (games.length === 1) {
            alert('You cannot delete the last remaining game.');
            return;
        }
        if (!confirm('Are you sure you want to delete this game?')) return;
        games.splice(currentGameIndex, 1);
        if (currentGameIndex >= games.length) currentGameIndex = games.length - 1;
        updateGameSelectUI();
        initPlayersAndUI(games[currentGameIndex]);
        saveGamesToStorage();
    };

    // Confirm throw
    window.confirmThrow = (playerNum) => {
        (playerNum === 1 ? _player1 : _player2).confirmThrow();
    };
    // Undo
    window.undoLast = (playerNum) => {
        (playerNum === 1 ? _player1 : _player2).undoLast();
    };
    // Multiplier select
    window.selectMultiplier = selectMultiplier;

    overlayDebugSVG();
}); 