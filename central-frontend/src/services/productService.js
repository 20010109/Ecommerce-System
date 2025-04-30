const PRODUCT_URL = process.env.REACT_APP_PRODUCT_URL || "http://localhost:8001";

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken") || "";
  return { Authorization: token };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to fetch data");
  }
  return await response.json();
};

export async function fetchProducts() {
  const response = await fetch(`${PRODUCT_URL}/getproducts`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function fetchProductById(id) {
  const response = await fetch(`${PRODUCT_URL}/getproducts/${id}`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function fetchProductVariantsById(id) {
  const response = await fetch(`${PRODUCT_URL}/getproducts/${id}/variants`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}
