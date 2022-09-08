/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsEntriesStreamingToUser
// ====================================================

export interface DripsEntriesStreamingToUser_dripsEntries {
  __typename: 'DripsEntry';
  user: any;
  account: any;
  amtPerSec: any;
  isAccountDrip: boolean;
}

export interface DripsEntriesStreamingToUser {
  dripsEntries: DripsEntriesStreamingToUser_dripsEntries[];
}

export interface DripsEntriesStreamingToUserVariables {
  user: any;
}
