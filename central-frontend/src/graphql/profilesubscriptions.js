import { gql } from '@apollo/client';

export const PROFILE_SUBSCRIPTION = gql`
subscription MyProfile {
  users(where: { id: { _eq: "X-Hasura-User-Id" } }) {
    id
    username
    first_name
    last_name
    phone_number
    profile_image_url
    shop_name
    status
    role
    email
    address {
      street
      city
      state
      postal_code
      country
    }
    updated_at
  }
}
`;
