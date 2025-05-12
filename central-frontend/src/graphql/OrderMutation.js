import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
mutation CreateOrder($order: orders_insert_input!) {
    insert_orders_one(object: $order) {
      id
      buyer_id
      buyer_name
      seller_id
      seller_username
      total_amount
      status
      payment_method
      payment_status
      shipping_method
      shipping_address
      contact_number
      order_date
      created_at
      updated_at
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
