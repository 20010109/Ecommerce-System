import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ApolloProvider from './ApolloProvider';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ApolloProvider>
        <App />
    </ApolloProvider>
);
