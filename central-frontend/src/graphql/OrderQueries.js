import { gql } from '@apollo/client';

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
      payment_verified_at
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

export const GET_ORDERS_BY_BUYER = gql`
  query GetOrdersByBuyer($id: Int!) {
    orders(where: { buyer_id: { _eq: $id } }, order_by: { created_at: desc }) {
      id
      status
      total_amount
    }
  }
`;

export const GET_ORDER_BY_ID = gql`
  query GetOrderById($id: Int!) {
    orders_by_pk(id: $id) {
      id
      buyer_name
      order_date
      status
      payment_method
      payment_status
      shipping_method
      shipping_address
      contact_number
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