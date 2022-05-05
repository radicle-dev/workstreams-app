import { gql } from 'graphql-tag';

export const GET_DRIPS_CONFIGS = gql`
  query DripsConfigs($id: ID!) {
    dripsConfigs(where: { id: $id }, first: 1) {
      id
      balance
      timestamp: lastUpdatedBlockTimestamp
      receivers: dripsEntries {
        receiver
        amtPerSec
      }
    }
  }
`;
