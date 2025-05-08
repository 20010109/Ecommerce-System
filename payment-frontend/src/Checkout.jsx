import React from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_PAYMENT = gql`
    mutation CreatePayment($input: NewPayment!) {
        createPayment(input: $input) {
            id
            orderId
            userId
            amount
            currency
            paymentStatus
            transactionReference
        }
    }
`;

export default function Checkout() {
    const [createPayment, { data, loading, error }] = useMutation(CREATE_PAYMENT);

    const handlePlaceOrder = async () => {
        try {
            await createPayment({
                variables: {
                    input: {
                        orderId: 1001,
                        userId: 2002,
                        amount: 3425.00,
                        currency: 'PHP',
                        paymentMethod: 'card',
                        paymentProvider: 'BPI',
                    },
                },
            });
            alert('Payment created successfully!');
        } catch (err) {
            console.error(err);
            alert('Payment failed');
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white shadow-md p-6 rounded-lg mt-8">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>
            <button
                onClick={handlePlaceOrder}
                className="mt-6 w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
            >
                Place Order
            </button>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
            {data && (
                <pre className="bg-gray-100 mt-4 p-2 rounded">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}
