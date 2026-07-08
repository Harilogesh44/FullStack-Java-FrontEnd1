document
    .getElementById("loginForm")
    .addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const message =
                document.getElementById(
                    "message"
                );

            const button =
                document.getElementById(
                    "loginButton"
                );

            message.textContent = "";

            button.disabled = true;

            button.textContent =
                "Logging in...";

            try {

                const response =
                    await fetch(
                         "https://fullstack-java-backend-4.onrender.com/auth/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                username: username,
                                password: password
                            })
                        }
                    );

                if (response.status === 401) {
                    throw new Error(
                        "Invalid username or password"
                    );
                }

                if (response.status === 400) {
                    const result =
                        (await response.text()).trim();
                    throw new Error(
                        result || "Please enter both username and password"
                    );
                }

                if (response.status === 403) {
                    throw new Error(
                        "Access denied. Please contact support."
                    );
                }

                if (response.status >= 500) {
                    throw new Error(
                        "Server error. Please try again later."
                    );
                }

                const result =
                    (await response.text())
                        .trim();

                if (!response.ok) {

                    throw new Error(
                        result ||
                        "Login failed"
                    );
                }

                if (!result.startsWith("eyJ")) {

                    throw new Error(
                        "Unexpected server response. Please try again."
                    );
                }

                localStorage.setItem(
                    "jwtToken",
                    result
                );

                localStorage.setItem(
                    "username",
                    username
                );

                message.style.color =
                    "green";

                message.textContent =
                    "Login successful.";

                setTimeout(
                    function () {

                        window.location.href =
                            "SwiftCheckoutDashboard.html";

                    },
                    1000
                );

            } catch (error) {

                if (error.name === "TypeError" &&
                    error.message === "Failed to fetch") {

                    message.style.color = "red";
                    message.textContent =
                        "Unable to connect to server. Please make sure the backend is running on port 8081.";

                } else {

                    message.style.color = "red";
                    message.textContent =
                        error.message;
                }

            } finally {

                button.disabled = false;

                button.textContent =
                    "Login";
            }
        }
    );
