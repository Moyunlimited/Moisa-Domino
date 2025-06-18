
const playerHand = document.getElementById('player-hand');
const botHand = document.getElementById('bot-hand');
const board = document.getElementById('board');
const drawPile = document.getElementById('draw-pile');
const passButton = document.getElementById('pass-button');

let tiles = [];
let playerTiles = [];
let botTiles = [];
let pile = [];
let boardTiles = [];

const MAX_TILES_BEFORE_L_SHAPE = 11;
let useVertical = false;

function createTiles() {
  tiles = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push([i, j]);
    }
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function drawTile(hand) {
  if (pile.length > 0) {
    const tile = pile.pop();
    hand.push(tile);
    render();
  }
}

function startGame() {
  createTiles();
  shuffle(tiles);
  playerTiles = tiles.splice(0, 7);
  botTiles = tiles.splice(0, 7);
  pile = tiles;
  boardTiles = [];
  render();
}

function createDots(value) {
  const positions = [
    '', '5', '1 9', '1 5 9', '1 3 7 9', '1 3 5 7 9', '1 3 4 6 7 9'
  ];
  const spots = positions[value] ? positions[value].split(' ') : [];
  let html = '';
  for (let i = 1; i <= 9; i++) {
    html += spots.includes(i.toString()) ? '<div class="dot"></div>' : '<div></div>';
  }
  return html;
}

function renderTile(tile, isBoardTile = false, vertical = false) {
  const div = document.createElement('div');
  div.className = 'domino';
  if (tile[0] === tile[1] || vertical) {
 
  } else if (isBoardTile) {
    div.classList.add('horizontal');
  }

  div.dataset.tile = JSON.stringify(tile);
  div.draggable = !isBoardTile;
  if (!isBoardTile) div.addEventListener('dragstart', onDragStart);

  div.innerHTML = `
    <div class="half">${createDots(tile[0])}</div>
    <div class="half">${createDots(tile[1])}</div>
  `;
  return div;
}

function render() {
  playerHand.innerHTML = '';
  playerTiles.forEach(tile => {
    playerHand.appendChild(renderTile(tile));
  });

  botHand.innerHTML = '';
  botTiles.forEach(tile => {
    const hidden = document.createElement('div');
    hidden.className = 'domino back';
    botHand.appendChild(hidden);
  });

  board.innerHTML = '';
  useVertical = boardTiles.length > MAX_TILES_BEFORE_L_SHAPE;

  boardTiles.forEach((tile, index) => {
    const isLturn = useVertical && index >= MAX_TILES_BEFORE_L_SHAPE;
    board.appendChild(renderTile(tile, true, tile[0] === tile[1] || isLturn));
  });
}

function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.dataset.tile);
}

board.addEventListener('dragover', (e) => {
  e.preventDefault();
});

board.addEventListener('drop', (e) => {
  e.preventDefault();
  const tile = JSON.parse(e.dataTransfer.getData('text/plain'));

  if (isValidMove(tile)) {
    placeTile(tile);
    playerTiles = playerTiles.filter(t => !(t[0] === tile[0] && t[1] === tile[1]));
    render();
    checkWin();
    setTimeout(botPlay, 500);
  }
});

function isValidMove(tile) {
  if (boardTiles.length === 0) return true;
  const left = boardTiles[0][0];
  const right = boardTiles[boardTiles.length - 1][1];
  return tile.includes(left) || tile.includes(right);
}

function placeTile(tile) {
  if (boardTiles.length === 0) {
    boardTiles.push(tile);
  } else {
    const left = boardTiles[0][0];
    const right = boardTiles[boardTiles.length - 1][1];

    if (tile[0] === right) {
      boardTiles.push(tile);
    } else if (tile[1] === right) {
      boardTiles.push([tile[1], tile[0]]);
    } else if (tile[1] === left) {
      boardTiles.unshift(tile);
    } else if (tile[0] === left) {
      boardTiles.unshift([tile[1], tile[0]]);
    }
  }
}

function botPlay() {
  const left = boardTiles[0][0];
  const right = boardTiles[boardTiles.length - 1][1];

  for (let i = 0; i < botTiles.length; i++) {
    const tile = botTiles[i];
    if (isValidMove(tile)) {
      placeTile(tile);
      botTiles.splice(i, 1);
      render();
      checkWin();
      return;
    }
  }
  if (pile.length > 0) {
    drawTile(botTiles);
    setTimeout(botPlay, 500);
  }
}

function checkWin() {
  if (playerTiles.length === 0) {
    setTimeout(() => alert("You win!"), 100);
  } else if (botTiles.length === 0) {
    setTimeout(() => alert("Bot wins!"), 100);
  }
}

passButton.addEventListener('click', () => {
  if (pile.length > 0) {
    drawTile(playerTiles);
    alert('You passed your turn and drew a tile.');
    setTimeout(botPlay, 500);
  } else {
    alert('No tiles left to draw.');
  }
});

drawPile.addEventListener('click', () => {
  drawTile(playerTiles);
});

startGame();
