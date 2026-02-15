import "./styles/history.scss";


// fetch history from json file
export function updateGameHistory(players) {
  // write to file game-history.json


  
  fs.writeFileSync("game-history.json", JSON.stringify(history, null, 2));
  // if user already has history, append to it, otherwise create new history
  const existingHistory = JSON.parse(fs.readFileSync("game-history.json", "utf-8"));
  const playerHistory = existingHistory[username] || [];
  playerHistory.push({
    opponent: players.find((p) => p.username !== username).username,
    result: "win", // or "loss" based on game outcome
    timestamp: new Date().toISOString(),
  });
  existingHistory[username] = playerHistory;
  fs.writeFileSync("game-history.json", JSON.stringify(existingHistory, null, 2));

}