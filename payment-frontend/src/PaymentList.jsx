import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PAYMENTS, VERIFY_PAYMENT, REFUND_PAYMENT } from './graphql';

export default function PaymentList() {
  const { data, loading, error, refetch } = useQuery(GET_PAYMENTS);
  const [verifyPayment] = useMutation(VERIFY_PAYMENT);
  const [refundPayment] = useMutation(REFUND_PAYMENT);

  const handleVerify = async (id) => {
    await verifyPayment({ variables: { paymentId: id } });
    refetch();
  };

  const handleRefund = async (id) => {
    await refundPayment({ variables: { paymentId: id } });
    refetch();
  };

  if (loading) return <p>Loading payments...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">All Payments</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>ID</th><th>Order</th><th>User</th><th>Amount</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.payments.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.orderId}</td>
              <td>{p.userId}</td>
              <td>{p.amount} {p.currency}</td>
              <td>{p.paymentStatus}</td>
              <td>
                {p.paymentStatus === 'pending' && (
                  <button onClick={() => handleVerify(p.id)} className="text-blue-500">Verify</button>
                )}
                {p.paymentStatus === 'completed' && (
                  <button onClick={() => handleRefund(p.id)} className="text-red-500">Refund</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
