const PRODUCT_URL = process.env.REACT_APP_PRODUCT_URL || "http://localhost:4002";

export async function fetchProducts() {
  const token = localStorage.getItem("authToken") || "";
  const response = await fetch(`${PRODUCT_URL}/products`, {
    headers: { Authorization: token },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return await response.json();
}

export async function fetchProductById(id) {
  const token = localStorage.getItem("authToken") || "";
  const response = await fetch(`${PRODUCT_URL}/products/${id}`, {
    headers: { Authorization: token },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return await response.json();
}
