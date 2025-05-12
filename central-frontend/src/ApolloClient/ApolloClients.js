import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

// 🔗 OrderService (Hasura at port 8003)
const orderHttpLink = createHttpLink({
  uri: "http://localhost:8003/v1/graphql",
});

// Optional: If Hasura needs Authorization header (remove if public access)
const orderAuthLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const orderClient = new ApolloClient({
  link: orderAuthLink.concat(orderHttpLink), // 🔁 if Hasura needs auth
  cache: new InMemoryCache(),
});

// 🔗 PaymentService (Custom Go GraphQL at port 8004)
const paymentHttpLink = createHttpLink({
  uri: "http://localhost:8004/query", // ✅ gqlgen default path
});

const paymentAuthLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const paymentClient = new ApolloClient({
  link: paymentAuthLink.concat(paymentHttpLink),
  cache: new InMemoryCache(),
});
