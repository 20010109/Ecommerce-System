import { gql } from "@apollo/client";

export const VERIFY_ONLINE_PAYMENT = gql`
mutation VerifyOnlinePayment($input: VerifyPaymentInput!) {
    verifyOnlinePayment(input: $input) {
      id
      orderId
      paymentStatus
      paidAt
    }
  }  
`;


export const GET_PAYMENT = gql`
  query GetPayment($paymentId: Int!) {
    payment(id: $paymentId) {
      id
      orderId
      paymentMethod
      paymentProvider
      paymentStatus
      paidAt
    }
  }
`;

export const GET_PAYMENT_BY_ORDER_ID = gql`
  query GetPaymentByOrderID($orderId: Int!) {
    getPaymentByOrderID(orderId: $orderId) {
      id
      orderId
      userId
      amount
      currency
      paymentMethod
      paymentStatus
      paymentProvider
      paidAt
      createdAt
      updatedAt
      transactionReference
    }
  }
`;
