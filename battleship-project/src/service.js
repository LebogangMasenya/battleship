import "./style.scss";
import * as serverLogic from "./utils.js";
import socketService from "./socket.js";
const socket = socketService.getSocket();
import Swal from "sweetalert2";

/*
const registerForm = document.getElementById("register-form");
registerForm.onsubmit = function(event) {
    event.preventDefault(); // stop the refresh to prevent losing the WebSocket connection
    const username = this.username.value;
    const password = this.password.value;
   socket.send(JSON.stringify({
        type: "register",
        username,
        password
    }));  
}
*/
/*
registerForm.addEventListener("submit",  (event) => {
    event.preventDefault(); // stop the refresh to prevent losing the WebSocket connection
    const username = event.target.username.value;
    const password = event.target.password.value;
    serverLogic.register(username, password, socket).subscribe(success => {
        next: if (success) {
            localStorage.setItem("username", username); 
            window.location.href = "/login.html"; 
        } else {
            console.error("Registration failed. Please try again.");
            break next;
        }
    });
});

*/
const loginForm = document.getElementById("login-form");
/*
loginForm.addEventListener("submit",  (event) => {
    event.preventDefault(); // stop the refresh to prevent losing the WebSocket connection
    const username = event.target.username.value;
    const password = event.target.password.value;
    serverLogic.login(username, password, socket).subscribe(success => {
       next: if (success) {
            localStorage.setItem("username", username); 
            window.location.href = "/lobby.html"; 
        } else {
            console.error("Login failed. Please try again.");
            break next;
        }
    });
});
*/

loginForm.onsubmit = function (event) {
  event.preventDefault(); // stop the refresh to prevent losing the WebSocket connection
  const username = this.username.value;
  const password = this.password.value;
  socket.send(
    JSON.stringify({
      type: "login",
      username,
      password,
    }),
  );
};

socket.onmessage = (event) => {
  console.log("Received message from server login:", event.data);
  const response = JSON.parse(event.data);
  if (response.type === "auth_success") {
    localStorage.setItem("username", response.user.username);
    localStorage.setItem("session", response.sessionToken);
    window.location.href = "/lobby.html";
  } else if (response.type === "auth_error") {
    console.error("Login failed. Please try again.");
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: "Invalid username or password. Please try again.",
    });
  } else if (response.type === "kicked") {
    localStorage.clear();
    Swal.fire({
      icon: "warning",
      title: "You have been kicked",
      text: "You have been removed from the lobby. Please log in again to continue playing.",
    }).then(() => {
      window.location.href = "/login.html";
    });
  }
};
