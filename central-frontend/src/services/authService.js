import axios from "axios";

// Set the base URL for all axios requests
const API = axios.create({
  baseURL: "http://localhost:8000", // Replace with your backend URL
});

export async function register(email, password) {
  const response = await API.post("/register", { email, password });
  if (response.status !== 200) {
    throw new Error(response.data.message || "Registration failed");
  }
  return response.data; // Return any relevant data from the backend
}

export async function login(email, password) {
  const response = await API.post("/login", { email, password });
  if (response.status !== 200) {
    throw new Error(response.data.message || "Login failed");
  }
  return response.data; // Return user data or token
}