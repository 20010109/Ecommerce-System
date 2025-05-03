import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';

// Define your Hasura endpoints
const HASURA_HTTP_URL = 'http://localhost:8080/v1/graphql';
const HASURA_WS_URL = 'ws://localhost:8080/v1/graphql';

// Dynamically attach JWT to HTTP requests
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token'); // 🔑 Get your JWT token from localStorage or any storage you use
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// HttpLink for queries and mutations
const httpLink = new HttpLink({
  uri: HASURA_HTTP_URL,
});

// WebSocketLink for subscriptions (also passes JWT)
const wsLink = new WebSocketLink({
  uri: HASURA_WS_URL,
  options: {
    reconnect: true,
    connectionParams: () => {
      const token = localStorage.getItem('token'); // 🔑 Get token dynamically here too
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
  },
});

// Split link:
// - Subscriptions → wsLink
// - Queries/Mutations → httpLink + authLink
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client instance
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});



export { client };
