import { useState } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      basePrice
      image
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: NewProductInput!) {
    createProduct(input: $input) {
      id
      name
    }
  }
`;

const GET_VARIANTS = gql`
  query GetVariants($productID: ID!) {
    productVariants(productID: $productID) {
      id
      variantName
      size
      color
      price
      stockQuantity
    }
  }
`;

const CREATE_VARIANT = gql`
  mutation CreateVariant($input: NewVariantInput!) {
    createVariant(input: $input) {
      id
      variantName
    }
  }
`;

export default function SellersPage() {
  const { data, loading } = useQuery(GET_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [createProduct] = useMutation(CREATE_PRODUCT, {
    refetchQueries: [{ query: GET_PRODUCTS }],
  });
  const [createVariant] = useMutation(CREATE_VARIANT);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Products</h2>
        {data.products.map(product => (
          <Card key={product.id} onClick={() => setSelectedProduct(product)} className="cursor-pointer">
            <CardContent>
              <h3 className="font-semibold">{product.name}</h3>
              <p>{product.description}</p>
            </CardContent>
          </Card>
        ))}
        <Button
          className="mt-4"
          onClick={() =>
            createProduct({
              variables: {
                input: {
                  name: 'New Product',
                  description: 'Description',
                  basePrice: 10.0,
                  image: 'https://example.com/image.jpg',
                },
              },
            })
          }
        >
          Add Product
        </Button>
      </div>

      <div>
        {selectedProduct ? (
          <>
            <h2 className="text-xl font-bold mb-4">{selectedProduct.name} Variants</h2>
            <VariantsList productID={selectedProduct.id} />
            <Button
              onClick={() =>
                createVariant({
                  variables: {
                    input: {
                      productID: selectedProduct.id,
                      variantName: 'Small',
                      size: 'S',
                      color: 'Red',
                      price: 12.99,
                      stockQuantity: 10,
                    },
                  },
                })
              }
            >
              Add Variant
            </Button>
          </>
        ) : (
          <p>Select a product to manage variants.</p>
        )}
      </div>
    </div>
  );
}

function VariantsList({ productID }) {
  const { data, loading } = useQuery(GET_VARIANTS, {
    variables: { productID },
  });

  if (loading) return <p>Loading variants...</p>;

  return (
    <div className="space-y-2">
      {data.productVariants.map(variant => (
        <Card key={variant.id}>
          <CardContent>
            <p>{variant.variantName} - {variant.size} - {variant.color}</p>
            <p>${variant.price} | Stock: {variant.stockQuantity}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
