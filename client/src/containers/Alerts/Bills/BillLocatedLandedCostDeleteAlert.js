import React from 'react';
import { Intent, Alert } from '@blueprintjs/core';
import { FormattedMessage as T } from 'components';
import intl from 'react-intl-universal';
import { useDeleteLandedCost } from 'hooks/query';

import { AppToaster } from 'components';

import withAlertActions from 'containers/Alert/withAlertActions';
import withAlertStoreConnect from 'containers/Alert/withAlertStoreConnect';

import { compose } from 'utils';

/**
 *  Bill transaction delete alert.
 */
function BillTransactionDeleteAlert({
  name,
  // #withAlertStoreConnect
  isOpen,
  payload: { BillId },
  // #withAlertActions
  closeAlert,
}) {
  const { mutateAsync: deleteLandedCostMutate, isLoading } =
    useDeleteLandedCost();

  // Handle cancel delete.
  const handleCancelAlert = () => {
    closeAlert(name);
  };

  // Handle confirm delete .
  const handleConfirmLandedCostDelete = () => {
    deleteLandedCostMutate(BillId)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_landed_cost_has_been_deleted_successfully'),
          intent: Intent.SUCCESS,
        });
        closeAlert(name);
      })
      .catch(() => {
        closeAlert(name);
      });
  };

  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={<T id={'delete'} />}
      icon="trash"
      intent={Intent.DANGER}
      isOpen={isOpen}
      onCancel={handleCancelAlert}
      onConfirm={handleConfirmLandedCostDelete}
      loading={isLoading}
    >
      <p><T id={`Once your delete this located landed cost, you won't be able to restore it later, Are your sure you want to delete this transaction?`}/></p>
    </Alert>
  );
}

export default compose(
  withAlertStoreConnect(),
  withAlertActions,
)(BillTransactionDeleteAlert);
