import { gql } from '@apollo/client';

// ✅ Subscription to listen for new products being added
export const SUBSCRIBE_TO_NEW_PRODUCTS = gql`
  subscription SubscribeToNewProducts {
    products(order_by: { created_at: desc }) {
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

// ✅ Subscription to listen for new product variants
export const SUBSCRIBE_TO_NEW_VARIANTS = gql`
  subscription SubscribeToNewVariants($productId: Int!) {
    product_variants(
      where: { product_id: { _eq: $productId } }
      order_by: { created_at: desc }
    ) {
      id
      variant_name
      size
      color
      stock_quantity
      image
      sku
    }
  }
`;

// Subscription to listen for real-time order updates
export const SUBSCRIBE_TO_ORDERS = gql`
  subscription SubscribeToOrders {
    orders(order_by: { created_at: desc }) {
      id
      buyer_name
      status
      total_amount
      created_at
    }
  }
`;