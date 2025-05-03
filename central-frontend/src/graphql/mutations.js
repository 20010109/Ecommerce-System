import { gql } from '@apollo/client';

// ✅ CREATE PRODUCT
export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $name: String!
    $description: String
    $basePrice: numeric!
    $image: String
    $category: String!
    $listed: Boolean!
  ) {
    insert_products(
      objects: {
        name: $name
        description: $description
        base_price: $basePrice
        image: $image
        category: $category
        listed: $listed
      }
    ) {
      returning {
        id
        name
        description
        base_price
        image
        category
        listed          # ✅ ensure we return listed status
      }
    }
  }
`;

// ✅ UPDATE PRODUCT
export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $id: Int!
    $name: String!
    $description: String
    $basePrice: numeric!
    $image: String
    $category: String!
  ) {
    update_products(
      where: { id: { _eq: $id } }
      _set: {
        name: $name
        description: $description
        base_price: $basePrice
        image: $image
        category: $category
      }
    ) {
      returning {
        id
        name
        description
        base_price
        image
        category
        updated_at
      }
    }
  }
`;

// ✅ DELETE PRODUCT
export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: Int!) {
    delete_products(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

// ✅ CREATE VARIANT
export const CREATE_VARIANT = gql`
  mutation CreateVariant(
    $productId: Int!
    $variantName: String!
    $size: String!
    $color: String!
    $stockQuantity: Int!
  ) {
    insert_product_variants(
      objects: {
        product_id: $productId
        variant_name: $variantName
        size: $size
        color: $color
        stock_quantity: $stockQuantity
      }
    ) {
      returning {
        id
        variant_name
        size
        color
        stock_quantity
        sku
      }
    }
  }
`;

// ✅ UPDATE VARIANT
export const UPDATE_VARIANT = gql`
  mutation UpdateVariant(
    $id: Int!
    $variantName: String
    $size: String
    $color: String
    $stockQuantity: Int
  ) {
    update_product_variants(
      where: { id: { _eq: $id } }
      _set: {
        variant_name: $variantName
        size: $size
        color: $color
        stock_quantity: $stockQuantity
      }
    ) {
      returning {
        id
        variant_name
        size
        color
        stock_quantity
        sku
      }
    }
  }
`;

// ✅ DELETE VARIANT
export const DELETE_VARIANT = gql`
  mutation DeleteVariant($id: Int!) {
    delete_product_variants(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

// ✅ TOGGLE LISTED STATUS
export const TOGGLE_LISTED_STATUS = gql`
  mutation ToggleListedStatus($id: Int!, $listed: Boolean!) {
    update_products(
      where: { id: { _eq: $id } }
      _set: { listed: $listed }
    ) {
      returning {
        id
        listed
      }
    }
  }
`;

