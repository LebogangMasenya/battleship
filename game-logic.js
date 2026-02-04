// Module for game logic and functionality

export function checkOverlap(shipType, startIndex, isHorizontal) {
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
export function shipSank(board, shipType) {

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
export function placeShip(shipType, startIndex, isHorizontal, board) {
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


export function fire(board) {
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