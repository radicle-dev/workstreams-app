/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsEntiresStreamingToUser
// ====================================================

export interface DripsEntiresStreamingToUser_dripsEntries {
  __typename: 'DripsEntry';
  user: any;
  account: any;
  amtPerSec: any;
  isAccountDrip: boolean;
}

export interface DripsEntiresStreamingToUser {
  dripsEntries: DripsEntiresStreamingToUser_dripsEntries[];
}

export interface DripsEntiresStreamingToUserVariables {
  user: any;
}
