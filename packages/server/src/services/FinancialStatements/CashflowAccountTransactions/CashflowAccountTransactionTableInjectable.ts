

import { Inject, Service } from 'typedi';
import CashflowAccountTransactionsService from '@/services/FinancialStatements/CashflowAccountTransactions/CashflowAccountTransactionsService';
import AccountTransactionTable from '@/services/FinancialStatements/CashflowAccountTransactions/CashflowAccountTransactionTable';
import { ICashflowAccountTransactionsQuery } from '@/interfaces';


@Service()
export class CashflowAccountTransactionsTableInjectable {
  @Inject()
  CashflowAccountTransactionsService :CashflowAccountTransactionsService

  /**
   * Retrieves the Cashflow Account Transaction table.
   * @param {number} tenantId
   * @param {ICashflowAccountTransactionsQuery} query
   */
public async table(
  tenantId: number,
  query: ICashflowAccountTransactionsQuery
) {
  const cashFlowAccountTransactions =
  await this.CashflowAccountTransactionsService.cashflowAccountTransactions(
    tenantId,
    query
  );
   const cashflowTable = new AccountTransactionTable(cashFlowAccountTransactions,query);
  return {
    table: {
      columns: cashflowTable.tableColumns(),
      rows: cashflowTable.tableRows(),
    },
  };
}
}