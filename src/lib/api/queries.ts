import { gql } from 'graphql-tag';

export const GET_LAST_DRIP_ENTRY = gql`
  query LastDripsEntry($user: Bytes!) {
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

export const GET_DRIPS_ACCOUNT = gql`
  query DripsAccount($id: ID!) {
    dripsAccount(id: $id) {
      id
      lastUpdatedBlockTimestamp
      dripsEntries {
        receiver
        amtPerSec
      }
      balance
    }
  }
`;
