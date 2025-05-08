import React from 'react';
import {
    ApolloClient,
    InMemoryCache,
    ApolloProvider as Provider,
} from '@apollo/client';

const client = new ApolloClient({
    uri: 'http://localhost:8080/query', // Your GraphQL Go backend
    cache: new InMemoryCache(),
});

export default function ApolloProvider({ children }) {
    return <Provider client={client}>{children}</Provider>;
}
