/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SplitsConfig
// ====================================================

export interface SplitsConfig_splitsConfig_splitsEntries {
  __typename: 'SplitsEntry';
  id: string;
  sender: any;
  receiver: any;
  weight: any;
}

export interface SplitsConfig_splitsConfig {
  __typename: 'SplitsConfig';
  id: string;
  lastUpdatedBlockTimestamp: any;
  splitsEntries: SplitsConfig_splitsConfig_splitsEntries[];
}

export interface SplitsConfig {
  splitsConfig: SplitsConfig_splitsConfig | null;
}

export interface SplitsConfigVariables {
  id: string;
}
