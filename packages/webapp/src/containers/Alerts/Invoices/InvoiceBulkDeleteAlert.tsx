// @ts-nocheck
import React, { useState } from 'react';
import { FormattedMessage as T } from '@/components';
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import { queryCache } from 'react-query';
import { AppToaster } from '@/components';

import { useBulkInvoiceDelete } from '@/hooks/query';
import { handleDeleteErrors } from '@/containers/Sales/Invoices/InvoicesLanding/components';


import withAlertStoreConnect from '@/containers/Alert/withAlertStoreConnect';
import withAlertActions from '@/containers/Alert/withAlertActions';

import { compose } from '@/utils';

/**
 * Invoice bulk delete alert.
 */
function InvoiceBulkDeleteAlert({
  // #ownProps
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { invoiceIds,setSelectedRows },

  // #withAlertActions
  closeAlert
}) {
  
  const [isLoading, setLoading] = useState(false);
  const { mutateAsync: BulkInvoiceDelete } = useBulkInvoiceDelete();

  const handleCancel = () => {
    closeAlert(name);
  };
  // Handle confirm accounts bulk delete.
  const handleConfirmBulkDelete = () => {
    setLoading(true);
    BulkInvoiceDelete(invoiceIds)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_invoices_has_been_successfully_deleted'),
          intent: Intent.SUCCESS,
        });
        setSelectedRows([]);
        closeAlert(name);
        closeDrawer(DRAWERS.ACCOUNT_DETAILS);
      })
      .catch((error) => {
        if (error?.response?.data?.errors) {
          handleDeleteErrors(error.response.data.errors);
        } 
        closeAlert(name);
      });
  };

  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={`${intl.get('delete')} (${invoiceIds.length})`}
      icon="trash"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirmBulkDelete}
      loading={isLoading}
    >
      <p>
        <T id={'are_sure_to_delete_selected_invoices'} values={{ count: invoiceIds.length }}/>
      </p>
    </Alert>
  );
}

export default compose(
  withAlertStoreConnect(),
  withAlertActions,
)(InvoiceBulkDeleteAlert);
