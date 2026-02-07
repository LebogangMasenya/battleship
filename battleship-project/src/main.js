import "./style.scss";
import { placeShip, shipSank, fire } from "./game-logic";


const toggleTheme = document.getElementById("toggle-theme");
toggleTheme.addEventListener("change", (e) => {
  if ( e.target.checked || cookieStore.get("theme")?.value === "dark") {
    document.body.classList.add("dark-theme");
    document.body.style.backgroundColor = "#121212";
    cookieStore.set("theme", "dark", { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
  } else {
    document.body.classList.remove("theme");
    document.body.style.backgroundColor = "#f0f0f0";
   
    cookieStore.set("theme", "light", { expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) });
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

const ships = {
  "carrier-ship": 5,
  "battleship-ship": 4,
  "cruiser-ship": 3,
  "submarine-ship": 3,
  "destroyer-ship": 2,
};

// place player ships
// @TODO: improve ship placement logic for wrapping and neighboring cells
playercells.forEach((cell) => {
  if (cell.classList.contains("ship-cell")) return; // prevent placing multiple ships on same cell

  if (selectedShip === "none") return; // no ship selected

  cell.addEventListener("click", () => {
    const startIndex = Array.from(playercells).indexOf(cell);
    const isHorizontal = selectedOrientation === "horizontal" ? true : false;
    placeShip(selectedShip, startIndex, isHorizontal, playercells);
  });
});

// enemy board listener
enemycells.forEach((cell) => {
  cell.addEventListener("click", () => {
    // if the cell is already hit, do nothing
    if (cell.style.color === "red" || cell.classList.contains("miss-cell")) {
      return;
    }

    // if the cell contains a ship, mark it as hit
    if (cell.classList.contains("ship-cell")) {
      cell.classList.add("hit-cell");

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

// place ships on enemy board (randomly place 5 ships)
for (let index = 0; index < 6; index++) {
  const shipTypes = Object.keys(ships);
  const shipType = shipTypes[index];
  let placed = false;

  while (!placed) {
    const startIndex = Math.floor(Math.random() * 144);
    const isHorizontal = Math.random() < 0.5;
    placed = placeShip(shipType, startIndex, isHorizontal, enemycells);
  }
}

const fireButton = document.querySelector(".fire-btn");
fireButton.addEventListener("click", () => {
  fire(enemycells);
  fire(playercells); // enemy randomly fires back
});
