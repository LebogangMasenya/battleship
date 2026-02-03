const boards = document.querySelectorAll('.board');

// add cells to both player and enemy boards
boards.forEach(board => {
  for (let i = 0; i < 144; i++) {
    const cell = document.createElement('div');
    cell.classList.add('board-cell');
    board.appendChild(cell);
  }
});

// add x and y axis labels



const playercells = document.querySelectorAll('#player-board .board-cell');
const enemycells = document.querySelectorAll('#enemy-board .board-cell');


// place player ships
playercells.forEach((cell) => {
  cell.addEventListener('click', () => {
    // toggle ship placement
    cell.classList.add('ship-cell');
  }); 
})

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


// add click event listeners to enemy board cells

enemycells.forEach(cell => {
  cell.addEventListener('click', () => {
    // if the cell is already hit, do nothing
    if (cell.style.color === 'red' || cell.classList.contains('miss-cell')) {
      return;
    }

    // if the cell contains a ship, mark it as hit
    if (cell.classList.contains('ship-cell')) {
      cell.style.backgroundColor='red';
      return;
    }


    // if the cell does not contain a ship, mark it as miss
    cell.innerHTML = 'x';
    cell.classList.add('miss-cell');

  });
});




// ship type selection
const shipSelect = document.getElementById('ship-select');
let selectedShip = shipSelect.value;

shipSelect.addEventListener('change', (e) => {
  selectedShip = e.target.value;
});


// mock ship placement on player board
for (let i = 0; i < 5; i++) {
  playercells[i].classList.add('ship-cell');
}


// place ships on enemy board (for demo purposes, randomly place 5 ships)
for (let i = 0; i < 5; i++) {
  const shipTypes = Object.keys(ships);
  const shipType = shipTypes[i];
  let placed = false;
  while (!placed) {
    const startIndex = Math.floor(Math.random() * 144);
    const isHorizontal = Math.random() < 0.5;
    placed = placeShip(shipType, startIndex, isHorizontal);
  }
}


function checkOverlap(shipType, startIndex, isHorizontal) {
  if(isHorizontal) {
    for(let i = 0; i < ships[shipType]; i++) {
      if(enemycells[startIndex + i].classList.contains('ship-cell')) {
        return true;
      }
    }
  } else {
    for(let i = 0; i < ships[shipType]; i++) {
      if(enemycells[startIndex + (i * 12)].classList.contains('ship-cell')) { // assuming board width is 12
        return true;
      }
    }
  }
  return false;
}

function shipSank(shipType) {

}
// for random ship placement
function placeShip(shipType, startIndex, isHorizontal) {
    // check to ensure no overlap
    if(checkOverlap(shipType, startIndex, isHorizontal)) {
      return false;
    }
    
  if(isHorizontal) {
    // check if ship fits horizontally
    if((startIndex % 12) + ships[shipType] > 12) {
      return false;
    }

    for(let i = 0; i < ships[shipType]; i++) {
      enemycells[startIndex + i].classList.add('ship-cell');
    }
  } else {
    // check if ship fits vertically
    if(Math.floor(startIndex / 12) + ships[shipType] > 12) {
      return false;
    }

    for(let i = 0; i < ships[shipType]; i++) {
      enemycells[startIndex + (i * 12)].classList.add('ship-cell'); // assuming board width is 12
    }
  }
  return true;
}


// fire button event listener
const fireButton = document.querySelector('.fire-btn');
fireButton.addEventListener('click', () => {
   // fire();
});