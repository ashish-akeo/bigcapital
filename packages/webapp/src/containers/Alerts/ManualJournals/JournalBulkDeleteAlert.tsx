//@ts-nocheck
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import { AppToaster, FormattedMessage as T } from '@/components';
import { useBulkDeleteManualJournal } from '@/hooks/query';

import withAlertActions from '@/containers/Alert/withAlertActions';
import withAlertStoreConnect from '@/containers/Alert/withAlertStoreConnect';

import { compose } from '@/utils';

/**
 * Journal publish alert.
 */
function JournalBulkDeleteAlert({
  name,
  
  // #withAlertStoreConnect
  isOpen,
  payload: { manualJournalIds, journalNumber, setSelectedRows },
  
  // #withAlertActions
  closeAlert,
}) {
  
  const { mutateAsync: BulkDeleteManualJournal, isLoading } = useBulkDeleteManualJournal();

  // Handle cancel manual journal alert.
  const handleCancel = () => {
    closeAlert(name);
  };

  // Handle confirm button click
  const handleConfirm = () => {
    BulkDeleteManualJournal(manualJournalIds)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_selected_manual_journals_has_been_deleted_successfully'),
          intent: Intent.SUCCESS,
        });
        setSelectedRows([]);
      })
      .catch((error) => {
      if (error.response.status === 422) {
        AppToaster.show({
          message: 'Select atleast one row',
          intent: Intent.DANGER,
        });
      }   
      else{
        AppToaster.show({
          message: 'Something went wrong!',
          intent: Intent.DANGER,
        })
      }
      })
      .finally(() => {
         // Trigger reload
        closeAlert(name); // Close alert after the operation
      });
  };

  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={<T id={'delete'} />}
      intent={Intent.WARNING}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirm} // You don't need to pass setIsReload here
      loading={isLoading}
    >
      <p>
        <T id={'are_sure_to_delete_selected_manual_journals'} />
      </p>
    </Alert>
  );
}

export default compose(
  withAlertStoreConnect(),
  withAlertActions,
)(JournalBulkDeleteAlert);
