// @ts-nocheck
import React,{useRef} from 'react';
import intl from 'react-intl-universal';
import { Intent, Menu, MenuItem, Tag,  ProgressBar, Button,Classes,Text, } from '@blueprintjs/core';
import { FormatDateCell, Icon, If,Stack,AppToaster } from '@/components';
import classNames from 'classnames';
import { safeCallback } from '@/utils';
import { useAccountTransactionsContext } from './AccountTransactionsProvider';
import FinancialLoadingBar from '@/containers/FinancialStatements/FinancialLoadingBar';
import { useAccountTransactionrSheetXlsxExport ,useAccountTransactionSheetCsvExport} from '@/hooks/query';

export function AccountTransactionsLoadingBar() {
  const {
    isBankAccountMetaSummaryFetching,
    isCurrentAccountFetching,
    isCashFlowAccountsFetching,
  } = useAccountTransactionsContext();

  const isLoading =
    isCashFlowAccountsFetching ||
    isCurrentAccountFetching ||
    isBankAccountMetaSummaryFetching;

  if (isLoading) {
    return <FinancialLoadingBar />;
  }
  return null;
}

export function ActionsMenu({
  payload: { onUncategorize, onUnmatch },
  row: { original },
}) {
  return (
    <Menu>
      {original.status === 'categorized' && (
        <MenuItem
          icon={<Icon icon="reader-18" />}
          text={'Uncategorize'}
          onClick={safeCallback(onUncategorize, original)}
        />
      )}
      {original.status === 'matched' && (
        <MenuItem
          text={'Unmatch'}
          icon={<Icon icon="unlink" iconSize={16} />}
          onClick={safeCallback(onUnmatch, original)}
        />
      )}
    </Menu>
  );
}

const allTransactionsStatusAccessor = (transaction) => {
  return (
    <Tag
      intent={
        transaction.status === 'categorized'
          ? Intent.SUCCESS
          : transaction.status === 'matched'
          ? Intent.SUCCESS
          : Intent.NONE
      }
      minimal={transaction.status === 'manual'}
    >
      {transaction.formatted_status}
    </Tag>
  );
};

/**
 * Retrieve account transctions table columns.
 */
export function useAccountTransactionsColumns() {
  return React.useMemo(
    () => [
      {
        id: 'date',
        Header: intl.get('date'),
        accessor: 'date',
        Cell: FormatDateCell,
        width: 110,
        className: 'date',
        clickable: true,
        textOverview: true,
      },
      {
        id: 'type',
        Header: intl.get('type'),
        accessor: 'formatted_transaction_type',
        className: 'type',
        width: 140,
        textOverview: true,
        clickable: true,
      },
      {
        id: 'transaction_number',
        Header: 'Transaction #',
        accessor: 'transaction_number',
        width: 160,
        className: 'transaction_number',
        clickable: true,
        textOverview: true,
      },
      {
        id: 'reference_number',
        Header: 'Ref.#',
        accessor: 'reference_number',
        width: 160,
        className: 'reference_number',
        clickable: true,
        textOverview: true,
      },
      {
        id: 'status',
        Header: 'Status',
        accessor: allTransactionsStatusAccessor,
      },
      {
        id: 'deposit',
        Header: intl.get('banking.label.deposit'),
        accessor: 'formatted_deposit',
        width: 110,
        className: 'deposit',
        textOverview: true,
        align: 'right',
        clickable: true,
        money: true,
      },
      {
        id: 'withdrawal',
        Header: intl.get('banking.label.withdrawal'),
        accessor: 'formatted_withdrawal',
        className: 'withdrawal',
        width: 150,
        textOverview: true,
        align: 'right',
        clickable: true,
        money: true,
      },
      {
        id: 'running_balance',
        Header: intl.get('banking.label.running_balance'),
        accessor: 'formatted_running_balance',
        className: 'running_balance',
        align: 'right',
        width: 150,
        textOverview: true,
        clickable: true,
        money: true,
      },
    ],
    [],
  );
}

/**
 * Renders the G/L sheet export menu.
 * @returns {JSX.Element}
 */
export const AccountTransactionSheetExportMenu = () => {
  const toastKey = useRef(null);
  const commonToastConfig = {
    isCloseButtonShown: true,
    timeout: 2000,
  };
  const {
    accountId
  } = useAccountTransactionsContext();

  const openProgressToast = (amount: number) => {
    return (
      <Stack spacing={8}>
        <Text>The report has been exported successfully.</Text>
        <ProgressBar
          className={classNames('toast-progress', {
            [Classes.PROGRESS_NO_STRIPES]: amount >= 100,
          })}
          intent={amount < 100 ? Intent.PRIMARY : Intent.SUCCESS}
          value={amount / 100}
        />
      </Stack>
    );
  };
  // Export the report to xlsx.
  const { mutateAsync: xlsxExport } = useAccountTransactionrSheetXlsxExport(
    {
      account_id: accountId,
    },
    {
      onDownloadProgress: (xlsxExportProgress: number) => {
        if (!toastKey.current) {
          toastKey.current = AppToaster.show({
            message: openProgressToast(xlsxExportProgress),
            ...commonToastConfig,
          });
        } else {
          AppToaster.show(
            {
              message: openProgressToast(xlsxExportProgress),
              ...commonToastConfig,
            },
            toastKey.current,
          );
        }
      },
    },
  );
  // Export the report to csv.
  const { mutateAsync: csvExport } = useAccountTransactionSheetCsvExport( {
    account_id: accountId,
  }, {
    onDownloadProgress: (xlsxExportProgress: number) => {
      if (!toastKey.current) {
        toastKey.current = AppToaster.show({
          message: openProgressToast(xlsxExportProgress),
          ...commonToastConfig,
        });
      } else {
        AppToaster.show(
          {
            message: openProgressToast(xlsxExportProgress),
            ...commonToastConfig,
          },
          toastKey.current,
        );
      }
    },
  });
  // Handle csv export button click.
  const handleCsvExportBtnClick = () => {
    csvExport();
  };
  // Handle xlsx export button click.
  const handleXlsxExportBtnClick = () => {
    xlsxExport();
  };

  return (
    <Menu>
      <MenuItem
        text={'XLSX (Microsoft Excel)'}
        onClick={handleXlsxExportBtnClick}
      />
      <MenuItem text={'CSV'} onClick={handleCsvExportBtnClick} />
    </Menu>
  );
};
