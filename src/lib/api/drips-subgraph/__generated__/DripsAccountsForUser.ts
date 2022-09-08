/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsAccountsForUser
// ====================================================

export interface DripsAccountsForUser_dripsConfig_dripsAccount {
  __typename: 'DripsAccount';
  isAccountDrip: boolean;
  id: string;
  account: any;
}

export interface DripsAccountsForUser_dripsConfig {
  __typename: 'DripsConfig';
  dripsAccount: DripsAccountsForUser_dripsConfig_dripsAccount[];
}

export interface DripsAccountsForUser {
  dripsConfig: DripsAccountsForUser_dripsConfig | null;
}

export interface DripsAccountsForUserVariables {
  user: string;
}
