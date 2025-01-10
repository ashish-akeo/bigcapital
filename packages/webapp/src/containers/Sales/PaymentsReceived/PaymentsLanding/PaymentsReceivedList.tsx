// @ts-nocheck
import React,{useState} from 'react';

import '@/style/pages/PaymentReceive/List.scss';

import { DashboardPageContent } from '@/components';
import { PaymentsReceivedListProvider } from './PaymentsReceivedListProvider';
import PaymentReceivesTable from './PaymentsReceivedTable';
import PaymentsReceivedActionsBar from './PaymentsReceivedActionsBar';

import withPaymentsReceived from './withPaymentsReceived';
import withPaymentsReceivedActions from './withPaymentsReceivedActions';

import { compose, transformTableStateToQuery } from '@/utils';

function PaymentsReceivedList({
  // #withPaymentsReceived
  paymentReceivesTableState,
  paymentsTableStateChanged,

  // #withPaymentsReceivedActions
  resetPaymentReceivesTableState,
}) {
  // Resets the payment receives table state once the page unmount.
  React.useEffect(
    () => () => {
      resetPaymentReceivesTableState();
    },
    [resetPaymentReceivesTableState],
  );
  const [selectedRows,setSelectedRows] = useState([]);

  return (
    <PaymentsReceivedListProvider
      query={transformTableStateToQuery(paymentReceivesTableState)}
      tableStateChanged={paymentsTableStateChanged}
    >
      <PaymentsReceivedActionsBar dataForBulkOperation={selectedRows} setSelectedRows={setSelectedRows} />

      <DashboardPageContent>
        <PaymentReceivesTable  setSelectedRows={setSelectedRows} />
      </DashboardPageContent>
    </PaymentsReceivedListProvider>
  );
}

export default compose(
  withPaymentsReceived(
    ({ paymentReceivesTableState, paymentsTableStateChanged }) => ({
      paymentReceivesTableState,
      paymentsTableStateChanged,
    }),
  ),
  withPaymentsReceivedActions,
)(PaymentsReceivedList);
