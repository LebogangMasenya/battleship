import "./styles/history.scss";
// import gameHistory from "./data/game-history.json";
import socketService from "./socket.js";
import { fromEvent } from "rxjs";
import { scan, startWith, filter, switchMap, take, map } from "rxjs/operators";


// add link back to game lobby
const historyLink = document.getElementById("nav-link");
//chamge to display lobby instead of history
if (historyLink) {
  historyLink.innerText = "Game Lobby";
  historyLink.href = "lobby.html";
}

const socket = socketService.getSocket();

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

socketMessages$
  .pipe(
    filter((res) => res.type === "auth_success"),
    take(1), // Once we are authed, move to the next step
    switchMap(() => {
      console.log("Authenticated! Now safe to request players.");
      socket.send(JSON.stringify({ type: "list_players" }));

      return socketMessages$.pipe(filter((res) => res.type === "player_list"));
    }),
  )
  .subscribe({
    next: (data) => {
      console.log("Current players in lobby:", data.players);
      updateGameHistoryTable(data.players);
    },
    error: (err) => console.error("Lobby Error:", err),
  });


export function updateGameHistoryTable(players) {
  let history = players.map(player => ({
    player: player.username,
    wins: player.stats.wins,
    losses: player.stats.losses,
    timestamp: Date.now()
  }));

  // clear existing history logs

  const historyLogs = document.getElementById("history-logs");
  
  history.forEach((entry) => {
    const logEntry = document.createElement("div");
    logEntry.classList.add("log-entry");
    logEntry.innerHTML = `
    <span>${new Date(entry.timestamp).toLocaleString()}</span>
    <span>${entry.player}</span>
    <span>${entry.wins}</span>
    <span>${entry.losses}</span>
    <span>${entry.wins}/${entry.losses}</span>
  `;
    historyLogs?.appendChild(logEntry);
  });

  saveGameHistoryToLocal(history);
}

function saveGameHistoryToLocal(history) {
  localStorage.setItem("gameHistory", JSON.stringify(history));
}
// VITE cannot use fs module in frontend, file operations should be handled in backend or via API calls :()


