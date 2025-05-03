import jwt_decode from "jwt-decode";

export function getUserRole() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwt_decode(token);
    // This assumes your JWT has the "is_seller" field.
    return decoded.is_seller ? "seller" : "buyer";
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
}
