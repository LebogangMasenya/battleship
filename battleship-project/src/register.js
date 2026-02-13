import "./style.scss";
import * as serverLogic from "./utils.js";

import socketService from "./socket.js";
const socket = socketService.getSocket();
import Swal from "sweetalert2";

const registerForm = document.getElementById("register-form");
registerForm.onsubmit = function (event) {
  event.preventDefault(); // stop the refresh to prevent losing the WebSocket connection
  const username = this.username.value;
  const password = this.password.value;
  socket.send(
    JSON.stringify({
      type: "register",
      username,
      password,
    }),
  );
};

socket.onmessage = (event) => {
  console.log("Received message from server:", event.data);
  const response = JSON.parse(event.data);
  if (response.type === "auth_success") {
    window.location.href = "/login.html";
  } else if (response.type === "auth_error") {
    console.error("Registration failed. Please try again.");
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: "Username may already be taken. Please try again.",
    });
  }
};
