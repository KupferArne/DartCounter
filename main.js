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

        // Check for victory
        if (this.score === 0) {
            // Get player number (1 or 2)
            const playerNumber = this === window._player1 ? 1 : 2;
            const playerName = document.getElementById(`player${playerNumber}Name`).textContent;
            showVictoryModal(playerName, playerNumber);
        }
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

function createNewGameWithNames(gameName, player1Name, player2Name) {
    return {
        gameName,
        player1Name,
        player2Name,
        player1: { score: 501, history: [] },
        player2: { score: 501, history: [] },
        completed: false,
        winner: null
    };
}

// Modal logic
function showNewGameModal(onCreate) {
    const modal = document.getElementById('newGameModal');
    const gameNameInput = document.getElementById('modalGameName');
    const player1Input = document.getElementById('modalPlayer1Name');
    const player2Input = document.getElementById('modalPlayer2Name');
    const errorDiv = document.getElementById('modalError');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const createBtn = document.getElementById('modalCreateBtn');

    // Reset fields
    gameNameInput.value = '';
    player1Input.value = '';
    player2Input.value = '';
    errorDiv.textContent = '';
    modal.style.display = 'flex';

    function closeModal() {
        modal.style.display = 'none';
        createBtn.onclick = null;
        cancelBtn.onclick = null;
    }

    cancelBtn.onclick = () => {
        closeModal();
    };
    createBtn.onclick = () => {
        const gameName = gameNameInput.value.trim();
        const player1Name = player1Input.value.trim();
        const player2Name = player2Input.value.trim();
        if (!gameName || !player1Name || !player2Name) {
            errorDiv.textContent = 'All fields are required.';
            return;
        }
        closeModal();
        onCreate(gameName, player1Name, player2Name);
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
        let displayName = g.gameName || `Game ${i + 1}`;
        if (g.completed && g.winner) {
            displayName += ` (Won by ${g.winner === 1 ? g.player1Name : g.player2Name})`;
        }
        opt.textContent = displayName;
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
        // Store score before the throw to check if it becomes 0
        const previousScore = _player1.score;
        origConfirmThrow1();

        // We need to manually check for victory here since the original confirmThrow's 
        // victory check might not be triggered due to the patching
        if (previousScore > 0 && _player1.score === 0) {
            showVictoryModal(document.getElementById('player1Name').textContent, 1);
        }

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
        // Store score before the throw to check if it becomes 0
        const previousScore = _player2.score;
        origConfirmThrow2();

        // We need to manually check for victory here since the original confirmThrow's 
        // victory check might not be triggered due to the patching
        if (previousScore > 0 && _player2.score === 0) {
            showVictoryModal(document.getElementById('player2Name').textContent, 2);
        }

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
        // Use modal for first game
        showNewGameModal((gameName, player1Name, player2Name) => {
            games.push(createNewGameWithNames(gameName, player1Name, player2Name));
            currentGameIndex = 0;
            updateGameSelectUI();
            initPlayersAndUI(games[currentGameIndex]);
            saveGamesToStorage();
        });
    } else {
        updateGameSelectUI();
        initPlayersAndUI(games[currentGameIndex]);
    }
    newGameBtn.onclick = () => {
        saveCurrentGameState();
        showNewGameModal((gameName, player1Name, player2Name) => {
            games.push(createNewGameWithNames(gameName, player1Name, player2Name));
            currentGameIndex = games.length - 1;
            updateGameSelectUI();
            initPlayersAndUI(games[currentGameIndex]);
            saveGamesToStorage();
        });
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

// Add victory modal function
function showVictoryModal(playerName, playerNumber) {
    // Create modal if it doesn't exist
    let victoryModal = document.getElementById('victoryModal');
    if (!victoryModal) {
        victoryModal = document.createElement('div');
        victoryModal.id = 'victoryModal';
        victoryModal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center;';

        const modalContent = document.createElement('div');
        modalContent.style.cssText = 'background:#fff; padding:32px 24px; border-radius:8px; max-width:90vw; width:350px; box-shadow:0 4px 16px rgba(0,0,0,0.2); display:flex; flex-direction:column; gap:16px; text-align:center;';

        const title = document.createElement('h2');
        title.id = 'victoryTitle';
        title.style.margin = '0 0 16px 0';

        const confetti = document.createElement('div');
        confetti.style.cssText = 'margin:24px 0; font-size:64px; line-height:1;';
        confetti.innerHTML = '🎯 🎉 🎯';

        const message = document.createElement('p');
        message.id = 'victoryMessage';
        message.style.fontSize = '18px';

        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = 'display:flex; gap:12px; justify-content:center; margin-top:16px;';

        const newGameBtn = document.createElement('button');
        newGameBtn.textContent = 'New Game';
        newGameBtn.style.cssText = 'background:#4CAF50; color:#fff; padding:8px 16px;';
        newGameBtn.onclick = function () {
            victoryModal.style.display = 'none';
            document.getElementById('newGameBtn').click();
        };

        const continueBtn = document.createElement('button');
        continueBtn.textContent = 'Continue';
        continueBtn.style.cssText = 'background:#2196F3; color:#fff; padding:8px 16px;';
        continueBtn.onclick = function () {
            victoryModal.style.display = 'none';
        };

        buttonsDiv.appendChild(newGameBtn);
        buttonsDiv.appendChild(continueBtn);

        modalContent.appendChild(title);
        modalContent.appendChild(confetti);
        modalContent.appendChild(message);
        modalContent.appendChild(buttonsDiv);

        victoryModal.appendChild(modalContent);
        document.body.appendChild(victoryModal);
    }

    // Update modal content
    document.getElementById('victoryTitle').textContent = 'Victory!';
    document.getElementById('victoryMessage').textContent = `${playerName} has won the game!`;

    // Show modal
    victoryModal.style.display = 'flex';

    // Update game state to mark this game as completed
    games[currentGameIndex].completed = true;
    games[currentGameIndex].winner = playerNumber;
    saveGamesToStorage();
} 