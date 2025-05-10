import axios from "axios";
import { jwtDecode } from "jwt-decode";

// Set the base URL for all axios requests
const API = axios.create({
  baseURL: "http://localhost:8000", // Replace with your backend URL
});

// Add an Axios request interceptor to include the token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====================== REGISTER ======================
export async function register(
  username,
  email,
  password,
  role,
  contact_number,
  address,
  birth_date = ""
) {
  try {
    const response = await API.post("/register", {
      username,
      email,
      password,
      role,
      phone_number: contact_number,
      address,
      birth_date,
    });

    if (response.status === 200 || response.status === 201) {
      return response.data;
    }

    throw new Error(response.data?.message || "Unexpected response from server");
  } catch (error) {
    throw new Error(error.response?.data?.message || "Registration failed");
  }
}


// ====================== LOGIN ======================
export async function login(email, password) {
  const response = await API.post("/login", { email, password });

  if (response.status !== 200) {
    throw new Error(response.data.message || "Login failed");
  }

  const { token } = response.data;

  // ✅ Store token in browser
  localStorage.setItem("token", token);

  // ✅ Decode the token to extract the user's role
  const decoded = jwtDecode(token);
  const role = decoded["https://hasura.io/jwt/claims"]["x-hasura-default-role"];

  // ✅ Store role so Header and routes can access it easily
  localStorage.setItem("role", role);

  return response.data;
}

// ====================== APPLY SELLER ======================
export async function applySeller(shopName = "", profileImageURL = "") {
  try {
    const response = await API.post("/apply-seller", {
      shop_name: shopName,
      profile_image_url: profileImageURL,
    });

    if (response.status === 200) {
      return response.data; // { message: "...success message..." }
    }

    throw new Error(response.data?.message || "Unexpected response from server");
  } catch (error) {
    console.error("Apply Seller error:", error);
    throw new Error(error.response?.data?.message || "Failed to apply as seller");
  }
}


// ====================== LOGOUT ======================
export function logout() {
  localStorage.removeItem("token"); // Clear token
  localStorage.removeItem("role");

  document.cookie = "supabase-auth-token=; Max-Age=0; path=/;";
  document.cookie = "csrf_token=; Max-Age=0; path=/;";
}

// ====================== GET PROFILE ======================
export async function getProfile() {
  try {
    const response = await API.get("/me");
    return response.data; // This will contain profile fields
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
}

// ====================== UPDATE PROFILE ======================
export async function updateProfile(profileData) {
  try {
    const response = await API.put("/profile/update", profileData);
    return response.data; // Expected: { message: "Profile updated successfully" }
  } catch (error) {
    console.error(error);
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
}
