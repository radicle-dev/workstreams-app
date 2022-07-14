/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DripsConfigs
// ====================================================

export interface DripsConfigs_dripsConfigs_receivers {
  __typename: 'DripsEntry';
  receiver: any;
  amtPerSec: any;
}

export interface DripsConfigs_dripsConfigs {
  __typename: 'DripsConfig';
  id: string;
  balance: any;
  timestamp: any;
  receivers: DripsConfigs_dripsConfigs_receivers[];
}

export interface DripsConfigs {
  dripsConfigs: DripsConfigs_dripsConfigs[];
}

export interface DripsConfigsVariables {
  id: string;
}
