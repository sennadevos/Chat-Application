const LOGIN_REQUEST_URL = "http://localhost:8080/api/auth/login";

const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");

const errorElement = document.querySelector(".error");

function login() {
    errorElement.textContent = "";

    if (usernameField.value === "") {
        errorElement.textContent = "Username is required";
        return;
    }

    if (passwordField.value === "") {
        errorElement.textContent = "Password is required";
        return;
    }

    const request = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: usernameField.value,
            password: passwordField.value
        })
    }

    fetch(LOGIN_REQUEST_URL, request)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message || "Unknown error occurred");
                });
            }
            return response.json();
        })
        .then(responseJson => {
            sessionStorage.setItem("accessToken", responseJson.data);
            window.location.href = "./chat.html";
        })
        .catch(error => {
            errorElement.textContent = error.message;
        });

}

document.getElementById("login-form")
    .addEventListener("submit", (event) => {
        event.preventDefault();
        login();
    });