import { useQuery } from "@apollo/client";
import { GET_PRODUCTS } from "../api";

export default function ProductList() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Products</h2>
      {data.products.map((product) => (
        <div key={product.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <strong>${product.base_price}</strong>
        </div>
      ))}
    </div>
  );
}
