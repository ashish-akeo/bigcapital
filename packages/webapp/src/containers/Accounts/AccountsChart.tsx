// @ts-nocheck
import React, { useEffect ,useState} from 'react';

import '@/style/pages/Accounts/List.scss';

import { DashboardPageContent, DashboardContentTable } from '@/components';
import { AccountsChartProvider } from './AccountsChartProvider';
import AccountsActionsBar from './AccountsActionsBar';
import AccountsDataTable from './AccountsDataTable';

import withAccounts from '@/containers/Accounts/withAccounts';
import withAccountsTableActions from './withAccountsTableActions';

import { transformAccountsStateToQuery } from './utils';
import { compose } from '@/utils';

/**
 * Accounts chart list.
 */
function AccountsChart({
  // #withAccounts
  accountsTableState,
  accountsTableStateChanged,

  // #withAccountsActions
  resetAccountsTableState,
}) {
  // Resets the accounts table state once the page unmount.
  useEffect(
    () => () => {
      resetAccountsTableState();
    },
    [resetAccountsTableState],
  );
  const [selectedRows, setSelectedRows] = useState([]);


  return (
    <AccountsChartProvider
      query={transformAccountsStateToQuery(accountsTableState)}
      tableStateChanged={accountsTableStateChanged}
    >
      <AccountsActionsBar dataForBulkOperation={selectedRows} setSelectedRows={setSelectedRows} />

      <DashboardPageContent>
        <DashboardContentTable>
          <AccountsDataTable setSelectedRows={setSelectedRows} />
        </DashboardContentTable>
      </DashboardPageContent>
    </AccountsChartProvider>
  );
}

export default compose(
  withAccounts(({ accountsTableState, accountsTableStateChanged }) => ({
    accountsTableState,
    accountsTableStateChanged,
  })),
  withAccountsTableActions,
)(AccountsChart);
