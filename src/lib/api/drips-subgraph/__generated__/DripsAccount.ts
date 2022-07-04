/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsAccount
// ====================================================

export interface DripsAccount_dripsAccount_dripsEntries {
  __typename: 'DripsEntry';
  receiver: any;
  amtPerSec: any;
}

export interface DripsAccount_dripsAccount {
  __typename: 'DripsAccount';
  id: string;
  lastUpdatedBlockTimestamp: any;
  dripsEntries: DripsAccount_dripsAccount_dripsEntries[];
  balance: any;
}

export interface DripsAccount {
  dripsAccount: DripsAccount_dripsAccount | null;
}

export interface DripsAccountVariables {
  id: string;
}
