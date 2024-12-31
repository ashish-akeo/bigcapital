// @ts-nocheck
import React, { Component } from 'react';

const AccountDeleteAlert = React.lazy(
  () => import('@/containers/Alerts/Accounts/AccountDeleteAlert'),
);
const AccountInactivateAlert = React.lazy(
  () => import('@/containers/Alerts/Accounts/AccountInactivateAlert'),
);
const AccountActivateAlert = React.lazy(
  () => import('@/containers/Alerts/Accounts/AccountActivateAlert'),
);
const AccountBulkDeleteAlert = React.lazy(
  () => import('@/containers/Alerts/Accounts/AccountBulkDeleteAlert')
)

export default [
  { name: 'account-delete', component: AccountDeleteAlert },
  { name: 'account-inactivate', component: AccountInactivateAlert },
  { name: 'account-activate', component: AccountActivateAlert },
  { name: 'account-bulk-delete',component:AccountBulkDeleteAlert}, 
];
