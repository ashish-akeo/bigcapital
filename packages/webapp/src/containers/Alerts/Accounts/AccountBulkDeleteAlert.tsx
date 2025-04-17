// @ts-nocheck
import React, { useState } from 'react';
import { FormattedMessage as T } from '@/components';
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import { queryCache } from 'react-query';
import { AppToaster } from '@/components';

import { handleDeleteErrors } from '@/containers/Accounts/utils';
import { useBulkAccountDelete } from '@/hooks/query';

// import withAccountsActions from '@/containers/Accounts/withAccountsActions';
import withAlertStoreConnect from '@/containers/Alert/withAlertStoreConnect';
import withAlertActions from '@/containers/Alert/withAlertActions';

import { compose } from '@/utils';

/**
 * Account bulk delete alert.
 */
function AccountBulkDeleteAlert({
  // #ownProps
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { accountsIds,setSelectedRows },

  // #withAlertActions
  closeAlert
}) {
  
  const [isLoading, setLoading] = useState(false);
  const { mutateAsync: BulkAccountDelete } = useBulkAccountDelete();

  const handleCancel = () => {
    closeAlert(name);
  };
  // Handle confirm accounts bulk delete.
  const handleConfirmBulkDelete = () => {
    setLoading(true);
    BulkAccountDelete(accountsIds)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_accounts_has_been_successfully_deleted'),
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
      confirmButtonText={`${intl.get('delete')} (${accountsIds.length})`}
      icon="trash"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirmBulkDelete}
      loading={isLoading}
    >
      <p>
        <T id={'are_sure_to_delete_selected_accounts'} values={{ count: accountsIds.length }}/>
      </p>
    </Alert>
  );
}

export default compose(
  withAlertStoreConnect(),
  withAlertActions,
  // withAccountsActions,
)(AccountBulkDeleteAlert);
