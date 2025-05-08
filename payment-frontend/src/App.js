import React from 'react';
import Checkout from './Checkout';
import PaymentList from './PaymentList'; // ✅ new import

function App() {
    return (
        <div>
            <Checkout />
            <PaymentList /> {/* ✅ new component */}
        </div>
    );
}

export default App;
