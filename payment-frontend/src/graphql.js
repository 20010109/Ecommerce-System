import { gql } from '@apollo/client';

export const GET_PAYMENTS = gql`
  query GetPayments {
    payments {
      id
      orderId
      userId
      amount
      currency
      paymentMethod
      paymentStatus
      transactionReference
      paidAt
      updatedAt
    }
  }
`;

export const VERIFY_PAYMENT = gql`
  mutation VerifyPayment($paymentId: ID!) {
    verifyPayment(paymentId: $paymentId) {
      id
      paymentStatus
      paidAt
    }
  }
`;

export const REFUND_PAYMENT = gql`
  mutation RefundPayment($paymentId: ID!) {
    refundPayment(paymentId: $paymentId) {
      id
      paymentStatus
      updatedAt
    }
  }
`;
