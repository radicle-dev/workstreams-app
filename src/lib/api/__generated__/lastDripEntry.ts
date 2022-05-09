/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: lastDripEntry
// ====================================================

export interface lastDripEntry_dripsEntries {
  __typename: 'DripsEntry';
  account: any;
  user: any;
  isAccountDrip: boolean;
  receiver: any;
}

export interface lastDripEntry {
  dripsEntries: lastDripEntry_dripsEntries[];
}

export interface lastDripEntryVariables {
  user: any;
}
