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
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders {
  orders {
    id
    buyer_id
    buyer_name
    seller_id
    seller_username
    status
    total_amount
    payment_method
    payment_status
    shipping_method
    shipping_address
    contact_number
    created_at
    order_items {
      id
      product_id
      variant_id
      product_name
      variant_name
      size
      color
      price
      quantity
      subtotal
      image_url
    }
  }
}
`;

// Query: Get order details by ID
export const GET_ORDER_DETAILS = gql`
  query GetOrderDetails($id: Int!) {
    orders_by_pk(id: $id) {
      id
      buyer_name
      shipping_address
      contact_number
      shipping_method
      payment_method
      payment_status
      status
      total_amount
      created_at
      order_items {
        id
        product_name
        variant_name
        quantity
        subtotal
      }
    }
  }
`;

