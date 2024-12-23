// @ts-nocheck
import React from 'react';
import intl from 'react-intl-universal';
import { Intent, Alert } from '@blueprintjs/core';
import { AppToaster,FormattedMessage as T } from '@/components';
import { useBulkPublishManualJournal } from '@/hooks/query';

import withAlertActions from '@/containers/Alert/withAlertActions';
import withAlertStoreConnect from '@/containers/Alert/withAlertStoreConnect';

import { compose } from '@/utils';

/**
 * Journal publish alert.
 */
function JournalBulkPublishAlert({
  name,

  // #withAlertStoreConnect
  isOpen,
  payload: { manualJournalIds, journalNumber ,setSelectedRows},

  // #withAlertActions
  closeAlert,
}) {
  
  const { mutateAsync: BulkPublishManualJournal, isLoading } = useBulkPublishManualJournal();

  // Handle cancel manual journal alert.
  const handleCancel = () => {
    closeAlert(name);
  };

  // Handle publish manual journal confirm.
  const handleConfirm = () => {
    BulkPublishManualJournal(manualJournalIds)
      .then(() => {
        AppToaster.show({
          message: intl.get('the_selected_manual_journals_has_been_published'),
          intent: Intent.SUCCESS,
        });
        setSelectedRows([]);
      })
      .catch((error) => {  
          if (error.response && error.response.data.errors) {
            if (error.response.data.errors[0]?.type === 'MANUAL_JOURNAL_ALREADY_PUBLISHED') {
              AppToaster.show({
                message: 'Manual journals is already published',
                intent: Intent.DANGER,
              });
          }
          else
          {
            AppToaster.show({
              message:'Something Went Wrong!!',
              intent: Intent.DANGER,
            })
          }
          }
          else
          {
            AppToaster.show({
              message:'Something Went Wrong!!',
              intent: Intent.DANGER,
            })
          }
       })
      .finally(() => {
        closeAlert(name);
      });
  };
  
  return (
    <Alert
      cancelButtonText={<T id={'cancel'} />}
      confirmButtonText={<T id={'publish'} />}
      intent={Intent.WARNING}
      isOpen={isOpen}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      loading={isLoading}
    >
      <p>
      <T id={'are_sure_to_publish_selected_manual_journals'} values={{count:manualJournalIds.length}} />
      </p>
    </Alert>
  );
}

export default compose(
  withAlertStoreConnect(),
  withAlertActions,
)(JournalBulkPublishAlert)