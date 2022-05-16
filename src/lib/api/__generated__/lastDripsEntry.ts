/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: lastDripsEntry
// ====================================================

export interface lastDripsEntry_dripsEntries {
  __typename: 'DripsEntry';
  account: any;
  user: any;
  isAccountDrip: boolean;
  receiver: any;
}

export interface lastDripsEntry {
  dripsEntries: lastDripsEntry_dripsEntries[];
}

export interface lastDripsEntryVariables {
  user: any;
}
