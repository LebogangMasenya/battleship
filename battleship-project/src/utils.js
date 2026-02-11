import { Subject, timeout } from 'rxjs';
import { from } from 'rxjs';
import { filter } from 'rxjs/operators';


const socketMessages$ = new Subject();




export function register(username, password, socket) {
    const body = {
        type: "register",
        username,
        password
    };

    socket.onmessage = (event) => {
    console.log("Received message from server:", event.data);
    const response = JSON.parse(event.data);
    socketMessages$.next(response);
};

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(body));
    } else {
        socket.onopen = () => {
            socket.send(JSON.stringify(body));
        };
    }

    return socketMessages$.pipe(
        filter(response => response.type === "auth_success" || response.type === "auth_failure"),
        filter(response => response.username === username), // Ensure we only react to messages related to the current username
        map(response => {
            if (response.type === "auth_success") {
                console.log("Registration successful!");
                alert("Registration successful! You can now log in with your new account.");
                return true;
            } else {
                console.error("Registration failed:", response.type);
                alert("Registration failed: " + response.message);
                return false;
            }
        }),
        take(1), // We only want to react to the first relevant message
        catchError(error => {
            console.error("WebSocket error:", error);
            alert("An error occurred while communicating with the server. Please try again.");
            return false;
        })
    )

}


export function login(username, password, socket) {
    let body = {
        type: "login",
        username,
        password
    };

    socket.onmessage = (event) => {
    console.log("Received message from server:", event.data);
    const response = JSON.parse(event.data);
    socketMessages$.next(response);
};
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(body));
    } else {
        socket.onopen = () => {
            socket.send(JSON.stringify(body));
        };
    }

    return socketMessages$.pipe(
        filter(response => response.type === "auth_success" || response.type === "auth_error"),
        map(response => {
            if (response.type === "auth_success") {
                console.log("Login successful!");
                return true;
            } else {
                console.error("Login failed:", response.type);
                alert("Login failed: " + response.message);
                return false;
            }
        }),
        take(1), // We only want to react to the first relevant message
        timeout(5000),
        catchError(error => {
            console.error("WebSocket error:", error);
            alert("An error occurred while communicating with the server. Please try again.");
            return false;
        })
    )

}

export async function logout() {
    let body = {
        type: "logout"
    };
}


// LOBBY
export async function listPlayers() {
    let body = {
        type: "list_players"
    };
}

