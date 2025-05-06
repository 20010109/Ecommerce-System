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
