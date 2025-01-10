import { Inject, Service } from 'typedi';
import { query } from 'express-validator';
import {
  NextFunction,
  Router,
  Request,
  Response,
  ValidationChain,
} from 'express';
import BaseFinancialReportController from '../BaseFinancialReportController';
import {
  AbilitySubject,
  ICashFlowStatementDOO,
  ReportsAction,
} from '@/interfaces';
import CashFlowTable from '@/services/FinancialStatements/CashFlow/CashFlowTable';
import HasTenancyService from '@/services/Tenancy/TenancyService';
import CashflowAccountTransactionsService from '@/services/FinancialStatements/CashflowAccountTransactions/CashflowAccountTransactionsService';
import { ServiceError } from '@/exceptions';
import CheckPolicies from '@/api/middleware/CheckPolicies';
import { ACCEPT_TYPE } from '@/interfaces/Http';
import { AccountTransactionApplication } from '@/services/FinancialStatements/CashflowAccountTransactions/CashflowAccountTransactionApplication';

@Service()
export default class CashFlowAccountTransactionsController extends BaseFinancialReportController {
  @Inject()
  tenancy: HasTenancyService;

  @Inject()
  cashflowAccountTransactions: CashflowAccountTransactionsService;


  @Inject()
  AccountTransactionApplication:AccountTransactionApplication
  /**
   * Router constructor.
   */
  router() {
    const router = Router();

    router.get(
      '/',
      CheckPolicies(
        ReportsAction.READ_CASHFLOW_ACCOUNT_TRANSACTION,
        AbilitySubject.Report
      ),
      this.validationSchema,
      this.validationResult,
      this.asyncMiddleware(this.cashFlow),
      this.catchServiceErrors
    );
    return router;
  }

  /**
   * Cashflow account transactions validation schecma.
   * @returns {ValidationChain[]}
   */
  get validationSchema(): ValidationChain[] {
    return [
      query('account_id').exists().isInt().toInt(),

      query('page').optional().isNumeric().toInt(),
      query('page_size').optional().isNumeric().toInt(),
    ];
  }

  /**
   * Retrieve the cashflow account transactions statment to json response.
   * @param {ICashFlowStatement} cashFlow -
   */
  private transformJsonResponse(casahflowAccountTransactions) {
    const { transactions, pagination } = casahflowAccountTransactions;

    return {
      transactions: this.transfromToResponse(transactions),
      pagination: this.transfromToResponse(pagination),
    };
  }

  /**
   * Transformes the report statement to table rows.
   * @param {ITransactionsByVendorsStatement} statement -
   */
  private transformToTableRows(
    cashFlowDOO: ICashFlowStatementDOO,
    tenantId: number
  ) {
    const i18n = this.tenancy.i18n(tenantId);
    const cashFlowTable = new CashFlowTable(cashFlowDOO, i18n);

    return {
      table: {
        data: cashFlowTable.tableRows(),
        columns: cashFlowTable.tableColumns(),
      },
      query: this.transfromToResponse(cashFlowDOO.query),
      meta: this.transfromToResponse(cashFlowDOO.meta),
    };
  }

  /**
   * Retrieve the cash flow statment.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @returns {Response}
   */
  private cashFlow = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const { tenantId } = req;
    const filter = this.matchedQueryData(req);
    const accept = this.accepts(req);
  
    const acceptType = accept.types([
      ACCEPT_TYPE.APPLICATION_JSON,
      ACCEPT_TYPE.APPLICATION_XLSX,
      ACCEPT_TYPE.APPLICATION_CSV,
    ]);
    try {
      const cashFlowAccountTransactions =
        await this.cashflowAccountTransactions.cashflowAccountTransactions(
          tenantId,
          filter
        );
        if (ACCEPT_TYPE.APPLICATION_CSV === acceptType) {
          const buffer = await this.AccountTransactionApplication.csv(tenantId, filter);
      
          res.setHeader('Content-Disposition', 'attachment; filename=output.csv');
          res.setHeader('Content-Type', 'text/csv');
      
          return res.send(buffer);
          // Retrieves the xlsx format.
        } else if (ACCEPT_TYPE.APPLICATION_XLSX === acceptType) {
          const buffer = await this.AccountTransactionApplication.xlsx(tenantId, filter);
      
          res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          return res.send(buffer);
          // Retrieves the pdf format.
        } 
        else {
          return res
            .status(200)
            .send(this.transformJsonResponse(cashFlowAccountTransactions));
        }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Catches the service errors.
   * @param {Error} error - Error.
   * @param {Request} req - Request.
   * @param {Response} res - Response.
   * @param {NextFunction} next -
   */
  private catchServiceErrors(
    error,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (error instanceof ServiceError) {
      if (error.errorType === 'ACCOUNT_ID_HAS_INVALID_TYPE') {
        return res.boom.badRequest(
          'The given account id should be cash, bank or credit card type.',
          {
            errors: [{ type: 'ACCOUNT_ID_HAS_INVALID_TYPE', code: 200 }],
          }
        );
      }
      if (error.errorType === 'account_not_found') {
        return res.boom.notFound('The given account not found.', {
          errors: [{ type: 'ACCOUNT.NOT.FOUND', code: 100 }],
        });
      }
    }
    next(error);
  }
  

  
}
