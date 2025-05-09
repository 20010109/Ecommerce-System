import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';

const HTTP_URL = 'http://localhost:8003/v1/graphql';
const WS_URL = 'ws://localhost:8003/v1/graphql';

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = new HttpLink({ uri: HTTP_URL });

const wsLink = new WebSocketLink({
  uri: WS_URL,
  options: {
    reconnect: true,
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      };
    },
  },
});

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

const orderClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});


export default orderClient;