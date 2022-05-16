import { gql } from 'graphql-tag';

export const GET_LAST_DRIP_ENTRY = gql`
  query lastDripsEntry($user: Bytes!) {
    dripsEntries(
      where: { user: $user, isAccountDrip: true }
      orderBy: account
      orderDirection: desc
      first: 1
    ) {
      account
      user
      isAccountDrip
      receiver
    }
  }
`;
