/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsConfig
// ====================================================

export interface DripsConfig_dripsConfig_dripsEntries {
  __typename: 'DripsEntry';
  receiver: any;
  amtPerSec: any;
}

export interface DripsConfig_dripsConfig_dripsAccount {
  __typename: 'DripsAccount';
  balance: any;
}

export interface DripsConfig_dripsConfig {
  __typename: 'DripsConfig';
  id: string;
  dripsEntries: DripsConfig_dripsConfig_dripsEntries[];
  dripsAccount: DripsConfig_dripsConfig_dripsAccount[];
}

export interface DripsConfig {
  dripsConfig: DripsConfig_dripsConfig | null;
}

export interface DripsConfigVariables {
  id: string;
}
