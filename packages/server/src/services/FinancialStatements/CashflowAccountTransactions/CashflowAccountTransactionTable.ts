import * as R from 'ramda';
import { ITableColumn, ITableColumnAccessor, ITableRow } from '@/interfaces';
import { ICashflowAccountTransactionsQuery } from '@/interfaces';

export default class AccountTransactionTable {
  private data: any;
  private query: ICashflowAccountTransactionsQuery;

  constructor(data: any, query: ICashflowAccountTransactionsQuery) {
    this.data = data;
    this.query = query;
  }

  private commonColumns(): ITableColumn[] {
    return [
      { key: 'date', label: 'Date' },
      { key: 'transaction_type', label: 'Type' },
      { key: 'transaction_number', label: 'Transaction #' },
      { key: 'reference_number', label: 'Ref.#' },
      { key: 'status', label: 'Status' },
      { key: 'deposit', label: 'Deposit' },
      { key: 'withdrawal', label: 'Withdrawal' },
      { key: 'running_balance', label: 'Running balance' },
    ];
  }

  private commonAccessors(): ITableColumnAccessor[] {
    return [
      { key: 'formattedDate', accessor: 'Date' },
      { key: 'formattedTransactionType', accessor: 'Type' },
      { key: 'transactionNumber', accessor: 'Transaction #' },
      { key: 'referenceType', accessor: 'Ref.#' },
      { key: 'formattedStatus', accessor: 'Status' },
      { key: 'deposit', accessor: 'Deposit' },
      { key: 'withdrawal', accessor: 'Withdrawal' },
      { key: 'formattedRunningBalance', accessor: 'Running balance' },
    ];
  }

  private rowMapper = (row: any): ITableRow => {    
    const columns = this.commonAccessors();
    const rowCells = columns.map((column) => {
      const columnKey = column.key;
      const cellValue = (row[columnKey] !== undefined && row[columnKey] !== null && row[columnKey] !== '') 
        ? row[columnKey] 
        : '';  
      return { key: columnKey, value: cellValue };
    });
    return { cells: rowCells };
  };

  public tableRows(): ITableRow[] {
    return R.map(this.rowMapper, this.data.transactions);
  }

  public tableColumns(): ITableColumn[] {
    return this.commonColumns();
  }
}
