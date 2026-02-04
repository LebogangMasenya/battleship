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

const orientationSelect = document.getElementById('orientation-select');
let selectedOrientation = orientationSelect.value;

orientationSelect.addEventListener('change', (e) => {
  selectedOrientation = e.target.value;
});
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
// @TODO: improve ship placement logic for wrapping and neighboring cells 
playercells.forEach((cell) => {
  if (cell.classList.contains('ship-cell')) return; // prevent placing multiple ships on same cell

  if(selectedShip === 'none') return; // no ship selected

  cell.addEventListener('click', () => {
    const startIndex = Array.from(playercells).indexOf(cell);
    const isHorizontal = selectedOrientation === 'horizontal' ? true : false;
    const placed = placeShip(selectedShip, startIndex, isHorizontal, playercells);

  });
})


// enemy board listener 
enemycells.forEach(cell => {
  cell.addEventListener('click', () => {
    // if the cell is already hit, do nothing
    if (cell.style.color === 'red' || cell.classList.contains('miss-cell')) {
      return;
    }

    // if the cell contains a ship, mark it as hit
    if (cell.classList.contains('ship-cell')) {
      cell.style.backgroundColor = 'red';

      // check if ship has sank and update accordingly
      shipSank(enemycells, cell.getAttribute('id').split('-')[0]);
      fire(playercells); // enemy fights back
      return;
    }

    // if the cell does not contain a ship, mark it as miss
    cell.innerHTML = 'x';
    cell.classList.add('miss-cell');
    fire(playercells); // enemy fights back
  });
});





// place ships on enemy board (randomly place 5 ships)
for (let i = 0; i < 6; i++) {
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
function shipSank(board, shipType) {

  // check if all cells of the ship have been hit
  const shipCells = Array.from(board).filter(cell => cell.getAttribute('id') && cell.getAttribute('id').startsWith(shipType));
  const allHit = shipCells.every(cell => cell.style.backgroundColor === 'red');

  if (allHit) {
    // remove ship-cell class and add sunk-cell class to visually indicate the ship has sank
    shipCells.forEach(cell => {
      cell.classList.remove('hit-cell');
      cell.classList.add('sunk-cell');
      cell.innerHTML = '*'
    });

    return true;
  }
  return false;
}

// TODO: check for immediate ship neighboring cells
function checkNeighboringCells(index) {
  return false;
}


// for random ship placement
function placeShip(shipType, startIndex, isHorizontal, board) {
  if(board[startIndex].classList.contains('ship-cell')) {
    return false; // there is already a ship at the starting index
  }
  
  // check to ensure no overlap
  if (checkOverlap(shipType, startIndex, isHorizontal)) {
    return false;
  }

  if (isHorizontal) {
    if ((startIndex % 12) + ships[shipType] > 12) {
      return false;
    }

    for (let i = 0; i < ships[shipType]; i++) {
      board[startIndex + i].classList.add('ship-cell');
      // mark id of ship for later reference when checking if it has sank
      board[startIndex + i].setAttribute('id', shipType + '-' + (i + 1));
    }
  } else {
    if (Math.floor(startIndex / 12) + ships[shipType] > 12) {
      return false;
    }

    for (let i = 0; i < ships[shipType]; i++) {
      board[startIndex + (i * 12)].classList.add('ship-cell');
      // mark id of ship for later reference when checking if it has sank
      board[startIndex + (i * 12)].setAttribute('id', shipType + '-' + (i + 1));
    }
  }
  return true;
}


function fire(board) {
  // randomly select a cell on the enemy board to fire at
  const randomIndex = Math.floor(Math.random() * 144);
  const cell =  board[randomIndex];

  // if the cell is already hit, do nothing
  if (cell.style.color === 'red' || cell.classList.contains('miss-cell')) {
    return;
  }

  // if the cell contains a ship, mark it as hit
  if (cell.classList.contains('ship-cell')) {
    cell.style.backgroundColor = 'red';
    shipSank(board, cell.getAttribute('id').split('-')[0]);
    return;
  }

  // if the cell does not contain a ship, mark it as miss
  cell.innerHTML = 'x';
  cell.classList.add('miss-cell');
}

const fireButton = document.querySelector('.fire-btn');
fireButton.addEventListener('click', () => {
  fire(enemycells);
  fire(playercells); // enemy randomly fires back
});