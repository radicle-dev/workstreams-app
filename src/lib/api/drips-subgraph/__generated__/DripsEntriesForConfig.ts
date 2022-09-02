/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsEntriesForConfig
// ====================================================

export interface DripsEntriesForConfig_dripsConfig_dripsEntries {
  __typename: 'DripsEntry';
  receiver: any;
  account: any;
  amtPerSec: any;
  isAccountDrip: boolean;
}

export interface DripsEntriesForConfig_dripsConfig {
  __typename: 'DripsConfig';
  dripsEntries: DripsEntriesForConfig_dripsConfig_dripsEntries[];
}

export interface DripsEntriesForConfig {
  dripsConfig: DripsEntriesForConfig_dripsConfig | null;
}

export interface DripsEntriesForConfigVariables {
  user: string;
}
