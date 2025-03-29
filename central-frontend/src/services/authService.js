const AUTH_URL = process.env.REACT_APP_AUTH_URL || "http://localhost:4000/auth";

export async function login(username, password) {
  const response = await fetch(`${AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  return await response.json(); // Expected to return { token: "..." }
}

export async function register(username, email, password) {
  const response = await fetch(`${AUTH_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    throw new Error("Registration failed");
  }
  return await response.json();
}
