import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById } from '../../api/productService';

export default function BuyerProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetchProductById(id).then(setProduct);
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <img src={product.image} alt={product.name} className="w-full max-w-md object-cover rounded-lg my-4" />
      <p className="text-lg text-gray-700">{product.description}</p>
      <p className="text-blue-600 font-bold text-xl my-2">${product.basePrice}</p>

      <h2 className="text-lg font-semibold mt-4">Variants</h2>
      <ul className="list-disc ml-6">
        {product.variants.map((variant) => (
          <li key={variant.id}>
            {variant.variantName} - {variant.size} / {variant.color} | Stock: {variant.stockQuantity}
          </li>
        ))}
      </ul>
    </div>
  );
}
