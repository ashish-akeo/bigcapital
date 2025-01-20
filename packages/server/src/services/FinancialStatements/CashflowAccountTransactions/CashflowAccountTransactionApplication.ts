import { Inject } from 'typedi';
import { CashflowAccountTransactionsTableInjectable } from './CashflowAccountTransactionTableInjectable';
import { CashflowAccountTransactionExportInjectable } from './CashflowAccountTransactionExportInjectable';
import { ICashflowAccountTransactionsQuery,ICashflowAccountTransaction } from '@/interfaces';

export class AccountTransactionApplication {
  @Inject()
  private AccountTransaction: CashflowAccountTransactionExportInjectable;


  /**
   * Retrieves the Cashflow Account transaction sheet in xlsx format.
   * @param {number} tenantId
   * @param {ICashflowAccountTransactionsQuery} query
   * @returns {}
   */
  public xlsx(
    tenantId: number,
    query: ICashflowAccountTransactionsQuery
  ): Promise<Buffer> {
    return this.AccountTransaction.xlsx(tenantId, query);
  }

  /**
   * Retrieves the Cashflow Account transaction sheet in csv format.
   * @param {number} tenantId -
   * @param {ICashflowAccountTransactionsQuery} query -
   */
  public csv(
    tenantId: number,
    query: ICashflowAccountTransactionsQuery
  ): Promise<string> {
    return this.AccountTransaction.csv(tenantId, query);
  }

}
