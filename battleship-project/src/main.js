import "./styles/style.scss";
import {
  placeShip,
  placeShipMapping,
  sendShipPlacementToServer,
  shipSank,
  fire,
  sendFireToServer,
  resetBoard,
  disableBoard
} from "./game-logic";
import { fromEvent, from } from "rxjs";
import { filter, map, tap } from "rxjs/operators";
import Swal from "sweetalert2";
import toastr from "toastr";
import socketService from "./socket.js";
const socket = socketService.getSocket();

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
    cell.id = `${letters[col - 2]}${row - 1}`;
    cell.style.gridRow = row;
    cell.style.gridColumn = col;
    board.appendChild(cell);
  }
});

const playercells = Array.from(
  document.querySelectorAll("#player-board .board-cell"),
);
const enemycells = Array.from(
  document.querySelectorAll("#enemy-board .board-cell"),
);

const enemyBoard = document.getElementById("enemy-board");

const isLoggedIn = !!localStorage.getItem("gameId");

// if logged in, show logout button and hide login/register buttons
const loginBtn = document.getElementById("login-btn");

if (!isLoggedIn) {
  if (loginBtn) loginBtn.style.display = "none";
}

loginBtn.addEventListener("click", () => {
  localStorage.removeItem("session");
  localStorage.removeItem("username");
  localStorage.removeItem("gameId");
  localStorage.removeItem("theme");
  localStorage.clear();
  socket.send(JSON.stringify({ type: "forfeit" }));
  socket.send(JSON.stringify({ type: "logout" }));
  window.location.href = "/login.html";
});

if (!isLoggedIn) {
  const swal$ = from(
    Swal.fire({
      title: "Welcome to Battleships!",
      text: "To save your progress and compete with friends, please register or login to your account.",
      confirmButtonText: "Register / Login",
      background: isDarkMode ? "var(--secondary-color)" : "var(--off-white)",
      color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
    }),
  );

  swal$.pipe(filter((result) => result.isConfirmed)).subscribe(() => {
    window.location.href = "/register.html";
  });
} else {
  Swal.fire({
    title: "Welcome to Battleships!",
    text: "Enemey ships have been spotted in the waters. Place your ships and attack to sink them before they sink you!",
    confirmButtonText: "Start Game",
    background: isDarkMode ? "var(--secondary-color)" : "var(--off-white)",
    color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
  });
}

const socketMessages$ = fromEvent(socket, "message").pipe(
  map((event) => JSON.parse(event.data)),
);

const sessionToken = localStorage.getItem("session");
const username = localStorage.getItem("username");

if (sessionToken) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "resume", sessionToken }));
  } else {
    socket.onopen = () =>
    socket.send(JSON.stringify({ type: "resume", sessionToken }));
  }
}

let gameStarted = false;
let yourTurn = false;
let playerReady = false;

socketMessages$
  .pipe(
    filter((res) => !!res.type),
    tap((res) => console.log("Received message from server:", res)),
  )
  .subscribe({
    next: (res) => {
      if (res.type === "auth_success") {
        console.log("Authenticated! Resuming game state...");
      } else if (res.type === "auth_error") {
        console.error("Some server error occurred. Please log in again.");
        Swal.fire({
          title: "Error",
          text: res.message,
          icon: "error",
          confirmButtonText: "Go to Login",
          background: isDarkMode
            ? "var(--secondary-color)"
            : "var(--off-white)",
          color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
        }).then(() => {
          localStorage.removeItem("session");
          localStorage.removeItem("username");
          window.location.href = "/login.html";
        });
      } else if (res.type === "error") {
        console.error("Error from server:", res.message);
        Swal.fire({
          title: "Error",
          text: res.message,
          icon: "error",
          confirmButtonText: "Okay",
          background: isDarkMode
            ? "var(--secondary-color)"
            : "var(--off-white)",
          color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
        });
      } else if (res.type === "reconnect_game_state") {
        if (res.ships.length === 0) {
          console.log("Empty game state received. Ready for ship placement.");
          return;
        }
        console.log("Received game state from server:", res.ships);
        localStorage.setItem("gameId", res.gameId);
        gameStarted = true;
        const gameState = { ships: res.ships, shots: res.shots };
        resetBoard(gameState, playercells, enemycells);
      } else if (res.type === "ships_accepted") {
        console.log(
          "Ship placement accepted by server. Waiting for opponent...",
        );
      } else if (res.type === "waiting_for_opponent") {
        console.log("Waiting for opponent to place their ships...");
        Swal.fire({
          title: "Waiting for Opponent",
          text: "Your opponent is still placing their ships. Please wait...",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          background: isDarkMode
            ? "var(--secondary-color)"
            : "var(--off-white)",
          color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
        });
      } else if (res.type === "game_start") {
        console.log("Game is starting!");
        gameStarted = true;
        yourTurn = res.yourTurn;
        // your turn = true, opponent= res.opponent
        Swal.fire({
          title: "Game Start!",
          text: "The battle begins now. Attack the enemy ships by clicking on the cells of the enemy board.",
          confirmButtonText: "Let's go!",
          icon: "success",
          background: isDarkMode
            ? "var(--secondary-color)"
            : "var(--off-white)",
          color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
        });
      } else if (res.type === "game_over") {
        console.log("Game over! Winner:", res.winner);
        Swal.fire({
          title: "Game Over",
          text:
            res.winner === username
              ? "Congratulations! You won!"
              : "You lost. Better luck next time!",
          icon: res.winner === username ? "success" : "error",
          confirmButtonText: "Play Again",
          background: isDarkMode
            ? "var(--secondary-color)"
            : "var(--off-white)",
          color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
        }).then(() => {
          localStorage.removeItem("gameId");
          window.location.href = "/lobby.html";
        });
      } else if (res.type === "shot_result") {
        console.log("Shoot result:", res);
        const { coordinate, hit } = res;
        let cell = enemycells.find((c) => c.id === coordinate);

        if (hit) {
          cell.classList.add("hit-cell");
          cell.style.backgroundColor = "red";

          if (res.sunk !== null) {
            // show a message that the ship has been sunk
            toastr.info(`You sunk the enemy's ${res.sunk}!`, "", {
              positionClass: "toast-top-center",
              timeOut: 3000,
              progressBar: true,
            });
          }
        } else {
          cell.innerText = "x";
          cell.classList.add("miss-cell");
        }
      } else if (res.type === "shot_fired") {
        console.log("Opponent shot at:", res.coordinate);
        let cell = playercells.find((c) => c.id.endsWith(`${res.coordinate}`));
        console.log("Cell being shot at:", cell);
        if (cell.classList.contains("ship-cell")) {
          cell.classList.add("hit-cell");
          cell.style.backgroundColor = "red";
        } else {
          cell.innerText = "x";
          cell.classList.add("miss-cell");
        }
      } else if (res.type === "turn_change") {
        if (res.currentTurn === username) {
          yourTurn = true;
          disableBoard(enemyBoard, enemycells, false);
        } else {
          yourTurn = false;
          disableBoard(enemyBoard, enemycells, true);
        }
      }
    },
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

const ships = {
  "carrier-ship": 5,
  "battleship-ship": 4,
  "cruiser-ship": 3,
  "submarine-ship": 3,
  "destroyer-ship": 2,
};


let playerShipsPlaced = 0;

let placedShips = {
  "carrier-ship": false,
  "battleship-ship": false,
  "cruiser-ship": false,
  "submarine-ship": false,
  "destroyer-ship": false,
};

let serverPlacement = [];
const shipSelect = document.getElementById("ship-select");

let selectedShip = shipSelect.value;
if(gameStarted) { // game already started, blocking ship selection
  shipSelect.disabled = true;
  selectedShip = "none";
} else {
  shipSelect.addEventListener("change", (e) => {
    selectedShip = e.target.value;
  });
}

const orientationSelect = document.getElementById("orientation-select");
let selectedOrientation = orientationSelect.value;

orientationSelect.addEventListener("change", (e) => {
  selectedOrientation = e.target.value;
});



const playercells2 = document.querySelectorAll("#player-board .board-cell");
const enemycells2 = document.querySelectorAll("#enemy-board .board-cell");

playercells2.forEach((cell) => {
  if (playerShipsPlaced >= 5) return; // all ships placed, stop allowing placement
  if (cell.classList.contains("ship-cell")) return; // prevent placing multiple ships on same cell
  if (selectedShip === "none") return; // no ship selected

  cell.addEventListener("click", () => {
    if(gameStarted) {
      return; // game already started, block ship placement 
    }
    const startIndex = Array.from(playercells2).indexOf(cell);
    const isHorizontal = selectedOrientation === "horizontal" ? true : false;

    if (placedShips[selectedShip]) {
      return;
    }
    if (placeShip(selectedShip, startIndex, isHorizontal, playercells2)) {
      serverPlacement.push(
        placeShipMapping(selectedShip, startIndex, isHorizontal),
      );
      placedShips[selectedShip] = true;
      shipSelect.querySelector(`option[value="${selectedShip}"]`).disabled =
        true;
      shipSelect.value = "none";
      playerShipsPlaced++;

      if (playerShipsPlaced === 5) {
        playerReady = true;
        sendShipPlacementToServer(socket, serverPlacement);

        Swal.fire({
          title: "All ships placed!",
          text: "The battle begins SOON. Attack the enemy ships by clicking on the cells of the enemy board.",
          confirmButtonText: "Let's go!",
          icon: "success",
          background: isDarkMode
            ? "var(--secondary-color)"
            : "var(--off-white)",
          color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
        });
      }
    }
  });
});

enemycells2.forEach((cell) => {
  cell.addEventListener("click", () => {
    if (!gameStarted) {
      Swal.fire({
        title: "Place all your ships first!",
        text: "You need to place all 5 of your ships on the board before you can start firing at the enemy.",
        confirmButtonText: "Okay",
        icon: "error",
        background: isDarkMode ? "var(--secondary-color)" : "var(--off-white)",
        color: isDarkMode ? "var(--off-white)" : "var(--dark-mode-bg)",
      });
      return;
    }

    const targetIndex = cell.id;
    sendFireToServer(socket, targetIndex);
  });
});

const fireButton = document.querySelector(".fire-btn");
fireButton.addEventListener("click", () => {
  // fire(enemycells);
  // fire(playercells); // enemy randomly fires back
});
