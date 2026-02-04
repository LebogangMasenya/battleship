// module for game structure constants
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

