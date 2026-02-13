import "./style.scss";
import * as serverLogic from "./utils.js";
import { fromEvent } from "rxjs";
import { scan, startWith, filter, switchMap, take, map } from "rxjs/operators";

import socketService from "./socket.js";
import Swal from "sweetalert2";
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
      updateLobbyUI(data.players);
    },
    error: (err) => console.error("Lobby Error:", err),
  });

const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  socket.send(JSON.stringify({ type: "logout" }));
  window.location.href = "/login.html";
});

// Listen for invites
const invites$ = socketMessages$.pipe(
  filter((res) => res.type === "invite_received"),
  // 'acc' is the current list, 'curr' is the new invite
  scan((acc, curr) => [...acc, curr], []),
  startWith([]),
);

invites$.subscribe({
  next: (invites) => {
    console.log("Current invites:", invites);
    updateInvitesUI(invites);
  },
  error: (err) => console.error("Invites Error:", err),
});

function updateLobbyUI(players) {
  const playerListElement = document.getElementById("player-list");
  playerListElement.innerHTML = "";
  if (players.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "No players in the lobby.";
    playerListElement.appendChild(listItem);
  }
  players.forEach((player) => {
    const listItem = document.createElement("li");
    listItem.textContent = player.username;
    playerListElement.appendChild(listItem);

    const stats = document.createElement("span");
    stats.textContent = ` Wins: ${player.stats.wins}, Losses: ${player.stats.losses}`;
    listItem.appendChild(stats);
    const inviteButton = document.createElement("button");
    inviteButton.classList.add("lobby-btn");
    inviteButton.textContent = "Invite to Game";
    inviteButton.onclick = () => {
      console.log("Inviting player:", player.username);
      sendInvite(player.username);
    };
    listItem.appendChild(inviteButton);
  });
}

function updateInvitesUI(invites) {
  const inviteListElement = document.getElementById("invite-list");
  inviteListElement.innerHTML = "";
  if (invites.length === 0) {
    const listItem = document.createElement("li");
    listItem.textContent = "No pending invites.";
    inviteListElement.appendChild(listItem);
  } else {
    invites.forEach((invite) => {
      const listItem = document.createElement("li");
      listItem.textContent = `Invite from ${invite.from}`;
      inviteListElement.appendChild(listItem);

      const acceptButton = document.createElement("button");
      acceptButton.classList.add("lobby-btn");
      acceptButton.textContent = "Accept";
      acceptButton.onclick = () => acceptInvite(invite.inviteId);
      listItem.appendChild(acceptButton);

      const declineButton = document.createElement("button");
      declineButton.classList.add("lobby-btn");
      declineButton.textContent = "Decline";
      declineButton.onclick = () => declineInvite(invite.inviteId);
      listItem.appendChild(declineButton);
    });
  }
}

function sendInvite(targetUsername) {
  console.log("Sending invite to:", targetUsername);

  socket.send(
    JSON.stringify({
      type: "send_invite",
      targetUsername,
    }),
  );
}

function acceptInvite(inviteId) {
  console.log("Accepting invite...");

  socket.send(
    JSON.stringify({
      type: "accept_invite",
      inviteId: inviteId,
    }),
  );
}

function declineInvite(inviteId) {
  console.log("Declining invite...");

  socket.send(
    JSON.stringify({
      type: "decline_invite",
      inviteId: inviteId,
    }),
  );
}

// listen for accepted invites to start game
socketMessages$
  .pipe(
    filter((res) => res.type === "invite_accepted"),
    take(1), // first accepted invite should start the game
  )
  .subscribe({
    next: (data) => {
      console.log("Invite accepted, starting game with:", data.inviteId);
      localStorage.setItem("gameId", data.gameId);
      window.location.href = "/index.html";
    },
    error: (err) => console.error("Invite Accepted Error:", err),
  });

// update if invite is declined
socketMessages$
  .pipe(filter((res) => res.type === "invite_declined"))
  .subscribe({
    next: (data) => {
      console.log("Invite declined by:");
      Swal.fire({
        icon: "info",
        title: "Invite Declined",
        text: `Your invite was declined`,
      });
    },
    error: (err) => console.error("Invite Declined Error:", err),
  });
