import "./style.scss";
import * as serverLogic from "./utils.js";
const socket = new WebSocket("ws://localhost:3000");


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

socket.onmessage = (event) => {
    
    console.log("Received message from server:", event.data);
    const response = JSON.parse(event.data);
    if (response.type === "auth_success") {
        window.location.href = "/login.html"; 
    } else if (response.type === "auth_error") {
        console.error("Registration failed. Please try again.");
    }
}