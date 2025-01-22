// @ts-nocheck
import React from 'react';

const PaymentReceivedDeleteAlert = React.lazy(
  () => import('@/containers/Alerts/PaymentReceived/PaymentReceivedDeleteAlert'),
);
const PaymentReceivedBulkDeleteAlert = React.lazy(
  () => import('@/containers/Alerts/PaymentReceived/PaymentReceivedBulkDeleteAlert')
)

/**
 * PaymentReceives alert.
 */
export default [
  { name: 'payment-received-delete', component: PaymentReceivedDeleteAlert },
  { name: 'payment-receive-bulk-delete',component: PaymentReceivedBulkDeleteAlert }
];
