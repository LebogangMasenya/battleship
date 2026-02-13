// Module for game logic and functionality

const ships = {
  "carrier-ship": 5,
  "battleship-ship": 4,
  "cruiser-ship": 3,
  "submarine-ship": 3,
  "destroyer-ship": 2,
};

function checkOverlap(shipType, startIndex, isHorizontal, board) {
  if (isHorizontal) {
    for (let index = 0; index < ships[shipType]; index++) {
      if (board && board[startIndex + index-1]?.classList.contains("ship-cell")) {
        return true;
      }
    }
  } else {
    for (let index = 0; index < ships[shipType]; index++) {
      if (board && board[startIndex + index * 12]?.classList.contains("ship-cell")) {
        return true;
      }
    }
  }
  return false;
}

// check and update that ship has sank
export function shipSank(board, shipType) {
  // check if all cells of the ship have been hit
  const shipCells = Array.from(board).filter(
    (cell) =>
      cell.getAttribute("id") && cell.getAttribute("id").startsWith(shipType),
  );
  const allHit = shipCells.every(
    (cell) => cell.style.backgroundColor === "red",
  );

  if (allHit) {
    // remove ship-cell class and add sunk-cell class to visually indicate the ship has sank
    shipCells.forEach((cell) => {
      cell.classList.remove("hit-cell");
      cell.classList.remove("ship-cell");
      cell.classList.add("sunk-cell");
      cell.textContent = "*";
      cell.style.border = "2px solid yellow";
    });

    return true;
  }
  return false;
}
// @TODO: add function to check if all ships have sank and end game accordingly
export function shipSankServer(board, shipType) {
  const length = ships[shipType + "-ship"];


}
// @TODO: check for immediate ship neighboring cells
function checkNeighboringCells(index) {
  return false;
}

// for random ship placement
export function placeShip(shipType, startIndex, isHorizontal, board) {
  if (board[startIndex].classList.contains("ship-cell")) {
    return false; // there is already a ship at the starting index
  }

  // check to ensure no overlap
  if (checkOverlap(shipType, startIndex, isHorizontal, board)) {
    return false;
  }

  let coordinates = [];

  if (isHorizontal) {
    if ((startIndex % 12) + ships[shipType] > 12) {
      return false;
    }

    for (let i = 0; i < ships[shipType]; i++) {
      board[startIndex + i].classList.add("ship-cell");
      // mark id of ship for later reference when checking if it has sank
      coordinates.push(indexToBattleCoord(startIndex + i));
      board[startIndex + i].setAttribute("id", shipType + "-" + indexToBattleCoord(startIndex + i));
    }
  } else {
    if (Math.floor(startIndex / 12) + ships[shipType] > 12) {
      return false;
    }

    for (let i = 0; i < ships[shipType]; i++) {
      board[startIndex + i * 12].classList.add("ship-cell");
      // mark id of ship for later reference when checking if it has sank
      coordinates.push(indexToBattleCoord(startIndex + i * 12));
      board[startIndex + i * 12].setAttribute("id", shipType + "-" + indexToBattleCoord(startIndex + i * 12));
    }
  }
  return true;
}

function indexToBattleCoord(index) {
  const GRID_SIZE = 12;
  const colLetter = String.fromCharCode(65 + (index % GRID_SIZE));

  const rowNumber = Math.floor(index / GRID_SIZE) + 1;

  return `${colLetter}${rowNumber}`;
}

const coordToIndex = (coord) => {
  const col = coord.charCodeAt(0) - 65; 
  const row = parseInt(coord.substring(1)) - 1;
  return (row * 12) + col;
};

export function placeShipMapping(shipType, startIndex, isHorizontal) {
  // strip the "-ship" suffix from the shipType to get the base type
  const baseType = shipType.replace("-ship", "");
  return {
    type: baseType,
    start: indexToBattleCoord(startIndex),
    orientation: isHorizontal ? "horizontal" : "vertical",
  };
}

export function sendShipPlacementToServer(socket, placement) {
  const data = {
    type: "place_ships",
    ships: placement,
} 
console.log("Sending ship placement to server:", data); 
socket.send(JSON.stringify(data)); 

}

export function sendFireToServer(socket, targetIndex) {
  const data = {
    type: "shoot",
    coordinate: targetIndex
  };
  console.log("Sending fire action to server:", data);
  socket.send(JSON.stringify(data));
}

export function fire(board) { 
  const randomIndex = Math.floor(Math.random() * 144); const cell = board[randomIndex];

  // if the cell is already hit, do nothing
  if (
    cell.classList.contains("hit-cell") ||
    cell.classList.contains("miss-cell")
  ) {
    return;
  }

  // if the cell contains a ship, mark it as hit
  if (cell.classList.contains("ship-cell")) {
    cell.classList.add("hit-cell");
    cell.style.backgroundColor = "red";
    shipSank(board, cell.getAttribute("id").split("-")[0]);
    return;
  }

  // if the cell does not contain a ship, mark it as miss
  cell.innerText = "x";
  cell.classList.add("miss-cell");
}


// @TODO: add function to improve CPU firing logic to target neighboring cells after a hit, and to avoid firing at already hit/miss cells


export function resetBoard(gameState, playerCells, enemyCells) {
  const ships = gameState.ships; 
  const shots = gameState.shots;

  // reset player board
  playerCells.forEach(cell => {
  cell.classList.remove("ship-cell", "hit-cell", "miss-cell", "sunk-cell");
  cell.style.backgroundColor = "";
  });

  // reset enemy board
  enemyCells.forEach(cell => {
    cell.classList.remove("hit-cell", "miss-cell", "sunk-cell");
  cell.style.backgroundColor = "";
  })

  // add ships back to player board based on game state
  ships.forEach(ship => {
      // Mark the ship's position
      ship.tiles.forEach(tile => {
        const cell = playerCells.find(c => c.id === tile);
        cell.classList.add("ship-cell");
         const idx = coordToIndex(tile);
      if (playerCells[idx]) {
        playerCells[idx].classList.add('ship', `ship-${ship.type}`);
          if (ship.hits.includes(tile)) {
            playerCells[idx].classList.add('hit-cell');
            playerCells[idx].innerHTML = '*'; 
            playerCells[idx].style.backgroundColor = "red";
         }
      }
      })

     
  })


  shots.forEach(shot => {
    const idx = coordToIndex(shot.coordinate);
    if(enemyCells[idx]) {
      if (shot.hit) {
        enemyCells[idx].classList.add('hit-cell');
        enemyCells[idx].innerHTML = '*';
        enemyCells[idx].style.backgroundColor = "red";
        // check if ship has sank and update accordingly
        shipSank(enemyCells, enemyCells[idx].getAttribute("id").split("-")[0]);
      }
    }

  });

}