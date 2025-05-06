import axios from "axios";

// Set the base URL for all axios requests
const API = axios.create({
  baseURL: "http://localhost:8000", // Replace with your backend URL
});

export async function register(username, email, password, role, contact_number, address) {
  try {
    const response = await API.post("/register", {
      username,
      email,
      password,
      role,  // ✅ this is the key fix
      phone_number: contact_number,
      address,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw new Error(response.data?.message || "Unexpected response from server");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
}

export async function login(email, password) {
  const response = await API.post("/login", { email, password });
  if (response.status !== 200) {
    throw new Error(response.data.message || "Login failed");
  }

  const { token } = response.data;
  localStorage.setItem("token", token); // Store JWT securely
  return response.data;
}

export function logout() {
  localStorage.removeItem("token"); // Clear the token

  // Optional: Clear cookies if any were set
  document.cookie = "supabase-auth-token=; Max-Age=0; path=/;";
  document.cookie = "csrf_token=; Max-Age=0; path=/;";
}
