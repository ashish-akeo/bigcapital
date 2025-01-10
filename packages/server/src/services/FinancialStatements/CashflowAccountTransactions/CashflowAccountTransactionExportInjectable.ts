
import { TableSheet } from '@/lib/Xlsx/TableSheet';
import { Inject, Service } from 'typedi';
import { CashflowAccountTransactionsTableInjectable } from './CashflowAccountTransactionTableInjectable';
import { ICashflowAccountTransactionsQuery } from '@/interfaces';
@Service()
export class CashflowAccountTransactionExportInjectable {
  @Inject()
  private  CashflowAccountTransactions: CashflowAccountTransactionsTableInjectable;

   /**
   * Retrieves the general ledger sheet in CSV format.
   * @param {number} tenantId
   * @param {ICashflowAccountTransactionsQuery} query
   * @returns {Promise<Buffer>}
   */

  public async xlsx(tenantId: number, query: ICashflowAccountTransactionsQuery): Promise<Buffer> {
    const table = await this.CashflowAccountTransactions.table(tenantId, query);

    const tableSheet = new TableSheet(table.table);
    const tableCsv = tableSheet.convertToXLSX();

    return tableSheet.convertToBuffer(tableCsv, 'xlsx');
  }

  /**
   * Retrieves the general ledger sheet in CSV format.
   * @param {number} tenantId
   * @param {ICashflowAccountTransactionsQuery} query
   * @returns {Promise<string>}
   */
  public async csv(
    tenantId: number,
    query: ICashflowAccountTransactionsQuery
  ): Promise<string> {
    const table = await this.CashflowAccountTransactions.table(tenantId, query);
    const tableSheet = new TableSheet(table.table);
    const tableCsv = tableSheet.convertToCSV();
    return tableCsv;
  }
}