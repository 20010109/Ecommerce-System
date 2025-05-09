import {
    ApolloClient,
    InMemoryCache,
    split,
    HttpLink
  } from '@apollo/client';
  import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
  import { createClient } from 'graphql-ws';
  import { getMainDefinition } from '@apollo/client/utilities';
  
  const httpLink = new HttpLink({
    uri: 'http://localhost:8005/v1/graphql',  // ✅ NGINX route
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const wsLink = new GraphQLWsLink(
    createClient({
      url: 'ws://localhost:8005/v1/graphql',  // ✅ For subscriptions
      connectionParams: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    })
  );
  
  // Split: use WS for subscription, HTTP for everything else
  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return (
        def.kind === 'OperationDefinition' &&
        def.operation === 'subscription'
      );
    },
    wsLink,
    httpLink
  );
  
  const userClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache()
  });
  
  export default userClient;