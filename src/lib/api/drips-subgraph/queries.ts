import { gql } from 'graphql-tag';

export const DRIPS_ACCOUNTS_FOR_USER = gql`
  query DripsAccountsForUser($user: ID!) {
    dripsConfig(id: $user) {
      dripsAccount {
        isAccountDrip
        id
        account
      }
    }
  }
`;

export const DRIPS_ENTRIES_STREAMING_TO_USER = gql`
  query DripsEntriesStreamingToUser($user: Bytes!) {
    dripsEntries(where: { receiver: $user }) {
      user
      account
      amtPerSec
      isAccountDrip
    }
  }
`;

export const GET_SPLITS_CONFIG = gql`
  query SplitsConfig($id: ID!) {
    splitsConfig(id: $id) {
      id
      lastUpdatedBlockTimestamp
      splitsEntries {
        id
        sender
        receiver
        weight
      }
    }
  }
`;
