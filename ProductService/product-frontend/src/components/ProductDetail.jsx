import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchProductById } from "../services/api";
import "./ProductDetail.css"

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProductById(id)
      .then((data) => setProduct(data))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Loading product...</div>;

  return (
    <div style={{ padding: "1rem" }}>
    <Link to={`/`}>Back</Link>
      <h1>{product.name}</h1>
      <img src={product.image} alt={product.name} style={{ width: "300px" }} />
      <p>{product.description}</p>
      <p>Price: ${product.basePrice}</p>
      {product.variants && product.variants.length > 0 && (
        <div>
          <h2>Variants</h2>
          <ul>
            {product.variants.map((variant) => (
              <li key={variant.id}>
                Size: {variant.size}, Color: {variant.color}, Price: $
                {variant.price}, Stock: {variant.stockQuantity}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
