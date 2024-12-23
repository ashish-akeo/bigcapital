// @ts-nocheck
import React, { useState, useEffect } from 'react';

import '@/style/pages/ManualJournal/List.scss';

import { DashboardPageContent } from '@/components';
import { transformTableStateToQuery, compose } from '@/utils';

import { ManualJournalsListProvider } from './ManualJournalsListProvider';
import ManualJournalsDataTable from './ManualJournalsDataTable';
import ManualJournalsActionsBar from './ManualJournalActionsBar';
import withManualJournals from './withManualJournals';

/**
 * Manual journals table.
 */
function ManualJournalsTable({
  journalsTableState,
  journalsTableStateChanged,
}) {
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <ManualJournalsListProvider
      query={transformTableStateToQuery(journalsTableState)}
      tableStateChanged={journalsTableStateChanged}
    >
      <ManualJournalsActionsBar
        dataForBulkOperation={selectedRows}
        setSelectedRows={setSelectedRows}
      />

      <DashboardPageContent>
        <ManualJournalsDataTable
          selectedRows={selectedRows}
          setSelectedRows={setSelectedRows}
        />
      </DashboardPageContent>
    </ManualJournalsListProvider>
  );
}

export default compose(
  withManualJournals(({ manualJournalsTableState, manualJournalTableStateChanged }) => ({
    journalsTableState: manualJournalsTableState,
    journalsTableStateChanged: manualJournalTableStateChanged,
  }))
)(ManualJournalsTable);
