import "./styles/history.scss";
// import gameHistory from "./data/game-history.json";

// VITE cannot use fs module in frontend, file operations should be handled in backend or via API calls :()

export function updateGameHistory(players) {
  // fs.writeFileSync("./data/game-history.json", JSON.stringify(history, null, 2));
  const existingHistory = JSON.parse(fs.readFileSync("./data/game-history.json", "utf-8"));
  let playerRegistry = []

  players.forEach((player) => {
    const { username, stats } = player;
    // "Upsert" (Update or Insert)
    playerRegistry[username] = {
      lastSeen: Date.now(),
      wins: stats.wins,
      losses: stats.losses,
      winRate: (stats.wins / (stats.wins + stats.losses || 1)).toFixed(2)
    };
  });

  existingHistory["PlayerRegistry"] = playerRegistry;
 // fs.writeFileSync("./data/game-history.json", JSON.stringify(existingHistory, null, 2));
}

// let history = JSON.parse(fs.readFileSync("./data/game-history.json", "utf-8"));

let history = [];

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
  historyLogs.appendChild(logEntry);
});