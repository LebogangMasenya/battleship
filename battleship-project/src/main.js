import "./style.scss";
import { placeShip, shipSank, fire } from "./game-logic";

import Swal from 'sweetalert2';

const toggleTheme = document.getElementById("toggle-theme");
let isDarkMode = localStorage.getItem("theme") === "dark";

function applyTheme(isDark) {
  if (isDark) {
    document.body.classList.add("dark-theme");
    document.body.style.background = "var(--dark-mode-bg)";
    if (toggleTheme) toggleTheme.checked = true;
  } else {
    document.body.classList.remove("dark-theme");
    document.body.style.background = "var(--off-white)";
    if (toggleTheme) toggleTheme.checked = false;
  }
}


applyTheme(isDarkMode);
Swal.fire({
  title: 'Welcome to Battleships!',
  text: 'Enemey ships have been spotted in the waters. Place your ships and attack to sink them before they sink you!',
  confirmButtonText: 'Start Game',
  background: isDarkMode ? 'var(--secondary-color)' : 'var(--off-white)',
  color: isDarkMode ? 'var(--off-white)' : 'var(--dark-mode-bg)'
});


toggleTheme.addEventListener("change", (e) => {
  if (e.target.checked) {
    document.body.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
    document.body.style.background = "var(--dark-mode-bg)";
  } else {
    localStorage.removeItem("theme"); 
    document.body.classList.remove("dark-theme");
    localStorage.setItem("theme", "light");
    document.body.style.background = "var(--off-white)";
  }
});


const boards = document.querySelectorAll(".board");

boards.forEach((board) => {
  // add letters for x-axis
  const letters = "ABCDEFGHIJKL";
  for (let letterIndex = 0; letterIndex < 12; letterIndex++) {
    const letterLabel = document.createElement("div");
    letterLabel.classList.add("letter-label");
    letterLabel.style.gridColumn = letterIndex + 2;
    letterLabel.style.gridRow = "1";
    letterLabel.innerText = letters[letterIndex];
    board.appendChild(letterLabel);
  }

  // add numbers for y-axis
  for (let numberIndex = 1; numberIndex <= 12; numberIndex++) {
    const numberLabel = document.createElement("div");
    numberLabel.classList.add("number-label");
    numberLabel.style.gridRow = numberIndex + 1;
    numberLabel.style.gridColumn = "1";
    numberLabel.innerText = numberIndex;
    board.appendChild(numberLabel);
  }

  for (let index = 0; index < 144; index++) {
    const cell = document.createElement("div");
    cell.classList.add("board-cell");
    const row = Math.floor(index / 12) + 2;
    const col = (index % 12) + 2;
    cell.style.gridRow = row;
    cell.style.gridColumn = col;
    board.appendChild(cell);
  }
});



const playercells = document.querySelectorAll("#player-board .board-cell");
const enemycells = document.querySelectorAll("#enemy-board .board-cell");

const ships = {
  "carrier-ship": 5,
  "battleship-ship": 4,
  "cruiser-ship": 3,
  "submarine-ship": 3,
  "destroyer-ship": 2,
};

// place ships on enemy board (randomly place 5 ships)
for (let index = 0; index < 5; index++) {
  const shipTypes = Object.keys(ships);
  const shipType = shipTypes[index];
  let placed = false;

  while (!placed) {
    const startIndex = Math.floor(Math.random() * 144);
    const isHorizontal = Math.random() < 0.5;
    placed = placeShip(shipType, startIndex, isHorizontal, enemycells);
  }
}

let playerShipsPlaced = 0;
let gameStarted = false;

let placedShips = {
  "carrier-ship": false,
  "battleship-ship": false,
  "cruiser-ship": false,
  "submarine-ship": false,
  "destroyer-ship": false,
}

// ship type selection
const shipSelect = document.getElementById("ship-select");

let selectedShip = shipSelect.value;

const orientationSelect = document.getElementById("orientation-select");
let selectedOrientation = orientationSelect.value;

orientationSelect.addEventListener("change", (e) => {
  selectedOrientation = e.target.value;
});
shipSelect.addEventListener("change", (e) => {
  selectedShip = e.target.value;
});

playercells.forEach((cell) => {
  if (playerShipsPlaced >= 5) return; // all ships placed, stop allowing placement
  if (cell.classList.contains("ship-cell")) return; // prevent placing multiple ships on same cell
  if (selectedShip === "none") return; // no ship selected

  cell.addEventListener("click", () => {
    const startIndex = Array.from(playercells).indexOf(cell);
    const isHorizontal = selectedOrientation === "horizontal" ? true : false;

    if (placedShips[selectedShip]) {
      return;
    }
    if (placeShip(selectedShip, startIndex, isHorizontal, playercells)) {
      placedShips[selectedShip] = true;
      shipSelect.querySelector(`option[value="${selectedShip}"]`).disabled = true; // disable option in dropdown once placed
      shipSelect.value = "none"; // reset selection
      playerShipsPlaced++;

      if (playerShipsPlaced === 5) {
        gameStarted = true;
        Swal.fire({
          title: 'All ships placed!',
          text: 'The battle begins now. Attack the enemy ships by clicking on the cells of the enemy board.',
          confirmButtonText: 'Let\'s go!',
          icon: 'success',
          background: isDarkMode ? 'var(--secondary-color)' : 'var(--off-white)',
          color: isDarkMode ? 'var(--off-white)' : 'var(--dark-mode-bg)',
        });
      }
    }
  });
});


// enemy board listener
enemycells.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!gameStarted) {
      Swal.fire({
        title: 'Place all your ships first!',
        text: 'You need to place all 5 of your ships on the board before you can start firing at the enemy.',
        confirmButtonText: 'Okay',
        icon: 'error',
        background: isDarkMode ? 'var(--secondary-color)' : 'var(--off-white)',
        color: isDarkMode ? 'var(--off-white)' : 'var(--dark-mode-bg)',
      });
      return;
    }

    // if the cell is already hit, do nothing
    if (cell.style.backgroundColor === "red" || cell.classList.contains("miss-cell")) {
      return;
    }

    // if the cell contains a ship, mark it as hit
    if (cell.classList.contains("ship-cell")) {
      cell.classList.add("hit-cell");
      cell.style.backgroundColor = "red";
      // check if ship has sank and update accordingly
      shipSank(enemycells, cell.getAttribute("id").split("-")[0]);
      fire(playercells); // enemy fights back
      return;
    }

    // if the cell does not contain a ship, mark it as miss
    cell.innerText = "x";
    cell.classList.add("miss-cell");
    fire(playercells); // enemy fights back
  });
});


const fireButton = document.querySelector(".fire-btn");
fireButton.addEventListener("click", () => {
  fire(enemycells);
  fire(playercells); // enemy randomly fires back
});
