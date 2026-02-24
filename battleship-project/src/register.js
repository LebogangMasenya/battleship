import "./styles/auth.scss";
import { fromEvent, debounceTime, map , distinctUntilChanged} from "rxjs";
/*
debounceTime: This operator is used to delay the emission of values from the source Observable. 
It will only emit a value from the source Observable if a certain amount of time has passed without another value being emitted. 
This is useful for scenarios like search input, where you want to wait for the user to stop typing before making an API call.
fromEvent: This operator creates an Observable that emits events of a specific type from a given event target. For example, you can use fromEvent to create an Observable that emits click events from a button element.

map: This operator is used to transform the items emitted by an Observable by applying a function to each item. It takes a function as an argument and applies it to each item emitted by the source Observable, returning a new Observable that emits the transformed items.
*/
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

// show usernamer and password requirements
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;
const username$ = fromEvent(usernameInput, "input").pipe(
  map((event) => event.target.value),
  debounceTime(200),
  distinctUntilChanged(), 
);

username$.subscribe((value) => {
  if (value.length > 0 && !USERNAME_REGEX.test(value)) {
    usernameInput.classList.add("is-invalid");
    // add tooltip with requirements
    usernameInput.setAttribute("title", "Username must be 3-20 characters long and can only contain letters, numbers, and underscores.");
    usernameInput.setCustomValidity(
      "Username must be 3-20 characters long and can only contain letters, numbers, and underscores.",
    );
  } else {
    usernameInput.classList.remove("is-invalid");
    usernameInput.setCustomValidity("");
  }
});

fromEvent(passwordInput, 'input').pipe(
  map(e => e.target.value),
  debounceTime(400)
).subscribe(pass => {
  if (pass.length > 0 && (pass.length < 6 || !/\d/.test(pass))) {
    passwordInput.setCustomValidity("Password must be at least 6 characters long and contain at least one number.");
    passwordInput.classList.add("is-invalid");
  } else {
    passwordInput.classList.remove("is-invalid");
    passwordInput.setCustomValidity("");
  }
});

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
