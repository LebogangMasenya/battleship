const boards = document.querySelectorAll('.board');

// add cells and axis labels to both player and enemy boards
boards.forEach(board => {
    // add letters for y-axis
  const letters = 'ABCDEFGHIJKL';
  for (let i = 0; i < 12; i++) {
    const letterLabel = document.createElement('div');
    letterLabel.classList.add('letter-label');
    letterLabel.style.gridRow = i + 2; // Offset by 1 for the number row
    letterLabel.style.gridColumn = "1";
    letterLabel.innerHTML = letters[i];
    board.appendChild(letterLabel);
  }

  // add numbers for x-axis
  for (let i = 1; i <=12 ; i++) {
    const numberLabel = document.createElement('div');
    numberLabel.style.gridColumn = i + 1; // Offset by 1 for the letter column
    numberLabel.style.gridRow = "1";
    numberLabel.innerHTML = i;
    board.appendChild(numberLabel);
  }

  for (let i = 0; i < 144; i++) {
    const cell = document.createElement('div');
    cell.classList.add('board-cell');
    board.appendChild(cell);
  }

});


const playercells = document.querySelectorAll('#player-board .board-cell');
const enemycells = document.querySelectorAll('#enemy-board .board-cell');

// ship type selection
const shipSelect = document.getElementById('ship-select');
let selectedShip = shipSelect.value;

shipSelect.addEventListener('change', (e) => {
  selectedShip = e.target.value;
});


/* 
Carrier: 5 connected tiles (e.g., dark gray or navy)
Battleship: 4 connected tiles
Cruiser: 3 connected tiles
Submarine: 3 connected tiles
Destroyer: 2 connected tiles
*/
const ships = {
  'carrier-ship': 5,
  'battleship-ship': 4,
  'cruiser-ship': 3,
  'submarine-ship': 3,
  'destroyer-ship': 2
}

// place player ships
playercells.forEach((cell) => {
  if (cell.classList.contains('ship-cell')) return; // prevent placing multiple ships on same cell

  if(selectedShip === 'none') return; // no ship selected

  cell.addEventListener('click', () => {
    const startIndex = Array.from(playercells).indexOf(cell);
    const isHorizontal = Math.random() < 0.5; // for simplicity, placing all ships horizontally
    const placed = placeShip(selectedShip, startIndex, isHorizontal, playercells);

  });
})



enemycells.forEach(cell => {
  cell.addEventListener('click', () => {
    // if the cell is already hit, do nothing
    if (cell.style.color === 'red' || cell.classList.contains('miss-cell')) {
      return;
    }

    // if the cell contains a ship, mark it as hit
    if (cell.classList.contains('ship-cell')) {
      cell.style.backgroundColor = 'red';
      return;
    }

    // if the cell does not contain a ship, mark it as miss
    cell.innerHTML = 'x';
    cell.classList.add('miss-cell');

  });
});







// place ships on enemy board (randomly place 5 ships)
for (let i = 0; i < 5; i++) {
  const shipTypes = Object.keys(ships);
  const shipType = shipTypes[i];
  let placed = false;

  while (!placed) {
    const startIndex = Math.floor(Math.random() * 144);
    const isHorizontal = Math.random() < 0.5;
    placed = placeShip(shipType, startIndex, isHorizontal, enemycells);
  }
}


function checkOverlap(shipType, startIndex, isHorizontal) {
  if (isHorizontal) {
    for (let i = 0; i < ships[shipType]; i++) {
      if (enemycells[startIndex + i].classList.contains('ship-cell')) {
        return true;
      }
    }
  } else {
    for (let i = 0; i < ships[shipType]; i++) {
      if (enemycells[startIndex + (i * 12)].classList.contains('ship-cell')) { // assuming board width is 12
        return true;
      }
    }
  }
  return false;
}

// check and update that ship has sank
function shipSank(shipType) {
  return false;
}

// check for immediate ship neighboring cells
function checkNeighboringCells(index) {
  return false;
}


// for random ship placement
function placeShip(shipType, startIndex, isHorizontal, board) {
  // check to ensure no overlap
  if (checkOverlap(shipType, startIndex, isHorizontal)) {
    return false;
  }

  if (isHorizontal) {
    // check if ship fits horizontally
    if ((startIndex % 12) + ships[shipType] > 12) {
      return false;
    }

    for (let i = 0; i < ships[shipType]; i++) {
      board[startIndex + i].classList.add('ship-cell');
    }
  } else {
    // check if ship fits vertically
    if (Math.floor(startIndex / 12) + ships[shipType] > 12) {
      return false;
    }

    for (let i = 0; i < ships[shipType]; i++) {
      board[startIndex + (i * 12)].classList.add('ship-cell');
    }
  }
  return true;
}


// fire button event listener
const fireButton = document.querySelector('.fire-btn');
fireButton.addEventListener('click', () => {
  // fire();
});