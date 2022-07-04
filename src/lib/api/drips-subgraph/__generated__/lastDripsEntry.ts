/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: LastDripsEntry
// ====================================================

export interface LastDripsEntry_dripsEntries {
  __typename: 'DripsEntry';
  account: any;
  user: any;
  isAccountDrip: boolean;
  receiver: any;
}

export interface LastDripsEntry {
  dripsEntries: LastDripsEntry_dripsEntries[];
}

export interface LastDripsEntryVariables {
  user: any;
}
