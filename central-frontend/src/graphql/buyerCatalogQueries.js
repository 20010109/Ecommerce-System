import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      base_price
      image
      category
      listed
      seller_id
      seller_username
      sku
      created_at
      updated_at
    }
  }
`;


export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: Int!) {
    products_by_pk(id: $id) {
      id
      name
      description
      base_price
      image
      created_at
      updated_at
      seller_username   
      seller_id
      sku
      product_variants_aggregate {
        aggregate {
          sum {
            stock_quantity
          }
        }
      }
    }
  }
`;

