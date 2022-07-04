/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: dripsEntries
// ====================================================

export interface dripsEntries_dripsEntries {
  __typename: 'DripsEntry';
  account: any;
  user: any;
  isAccountDrip: boolean;
  receiver: any;
}

export interface dripsEntries {
  dripsEntries: dripsEntries_dripsEntries[];
}

export interface dripsEntriesVariables {
  user: any;
}
