import { Service, Inject } from 'typedi';
import { Knex } from 'knex';
import {
  ISystemUser,
  ISaleInvoiceDeletePayload,
  ISaleInvoiceDeletedPayload,
  ISaleInvoiceDeletingPayload,
} from '@/interfaces';
import events from '@/subscribers/events';
import UnitOfWork from '@/services/UnitOfWork';
import { EventPublisher } from '@/lib/EventPublisher/EventPublisher';
import { ServiceError } from '@/exceptions';
import { ERRORS } from './constants';
import { UnlinkConvertedSaleEstimate } from '../Estimates/UnlinkConvertedSaleEstimate';
import HasTenancyService from '@/services/Tenancy/TenancyService';

@Service()
export class BulkDeleteSaleInvoice {
  @Inject()
  private tenancy: HasTenancyService;

  @Inject()
  private unlockEstimateFromInvoice: UnlinkConvertedSaleEstimate;

  @Inject()
  private eventPublisher: EventPublisher;

  @Inject()
  private uow: UnitOfWork;

  /**
   * Validate the sale invoice has no payment entries.
   * @param {number} tenantId
   * @param {number} saleInvoiceId
   */
  private async validateInvoiceHasNoPaymentEntries(
    tenantId: number,
    saleInvoiceIds:Array<number>
  ) {
    const { PaymentReceiveEntry } = this.tenancy.models(tenantId);

    // Retrieve the sale invoice associated payment receive entries.
    const entries = await PaymentReceiveEntry.query().whereIn(
      'invoice_id',
      saleInvoiceIds
    );
    if (entries.length > 0) {
      throw new ServiceError(ERRORS.INVOICE_HAS_ASSOCIATED_PAYMENT_ENTRIES);
    }
    return entries;
  }

  /**
   * Validate the sale invoice has no applied to credit note transaction.
   * @param {number} tenantId
   * @param {number} invoiceId
   * @returns {Promise<void>}
   */
  public validateInvoiceHasNoAppliedToCredit = async (
    tenantId: number,
    invoiceIds: Array<number>
  ): Promise<void> => {
    const { CreditNoteAppliedInvoice } = this.tenancy.models(tenantId);

    const appliedTransactions = await CreditNoteAppliedInvoice.query().whereIn(
      'invoiceId',
      invoiceIds
    );
    if (appliedTransactions.length > 0) {
      throw new ServiceError(ERRORS.SALE_INVOICE_HAS_APPLIED_TO_CREDIT_NOTES);
    }
  };

  /**
   * Validate whether sale invoice exists on the storage.
   * @param {Request} req
   * @param {Response} res
   * @param {Function} next
   */
  private async getInvoiceOrThrowError(
    tenantId: number,
    saleInvoiceIds: Array<number>
  ) {
    const { saleInvoiceRepository } = this.tenancy.repositories(tenantId);

    
    const saleInvoice = await saleInvoiceRepository.findWhereIn('id',saleInvoiceIds, [
      'entries',
      'paymentMethods',
    ]);
    if (!saleInvoice) {
      throw new ServiceError(ERRORS.SALE_INVOICE_NOT_FOUND);
    }
    return saleInvoice;
  }

  /**
   * Deletes the given sale invoice with associated entries
   * and journal transactions.
   * @param {number} tenantId - Tenant id.
   * @param {Number} saleInvoiceId - The given sale invoice id.
   * @param {ISystemUser} authorizedUser -
   */
  public async deleteBulkInvoices(
    tenantId: number,
    saleInvoiceIds: Array<number>,
    authorizedUser: ISystemUser
  ): Promise<void> {
    const { ItemEntry, SaleInvoice } = this.tenancy.models(tenantId);

    // Retrieve the given sale invoice with associated entries
    // or throw not found error.
    const oldSaleInvoices = await this.getInvoiceOrThrowError(
      tenantId,
      saleInvoiceIds
    );
    // Validate the sale invoice has no associated payment entries.
    await this.validateInvoiceHasNoPaymentEntries(tenantId, saleInvoiceIds);

    // Validate the sale invoice has applied to credit note transaction.
    await this.validateInvoiceHasNoAppliedToCredit(tenantId, saleInvoiceIds);

    // Triggers `onSaleInvoiceDelete` event.
    const saleInvoiceOnDeleteEvent = oldSaleInvoices.map((oldSaleInvoice)=>{
        return this.eventPublisher.emitAsync(events.saleInvoice.onDelete, {
            tenantId,
            oldSaleInvoice :oldSaleInvoice,
            saleInvoiceId :oldSaleInvoice.id,
        } as ISaleInvoiceDeletePayload);
    })

   await Promise.all(saleInvoiceOnDeleteEvent);

    // Deletes sale invoice transaction and associate transactions with UOW env.
    return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {
      // Triggers `onSaleInvoiceDeleting` event.
      const onSaleInvoiceOnDeletingEvent = oldSaleInvoices.map((oldSaleInvoice)=>{
        return this.eventPublisher.emitAsync(events.saleInvoice.onDeleting, {
            tenantId,
            oldSaleInvoice:oldSaleInvoice,
            saleInvoiceId:oldSaleInvoice.id,
            trx,
          } as ISaleInvoiceDeletingPayload);
      })
      await Promise.all(onSaleInvoiceOnDeletingEvent);

      // Unlink the converted sale estimates from the given sale invoice.
      await this.unlockEstimateFromInvoice.BulkunlinkConvertedEstimateFromInvoice(
        tenantId,
        saleInvoiceIds,
        trx
      );
      await ItemEntry.query(trx)
        .whereIn('reference_id', saleInvoiceIds)
        .where('reference_type', 'SaleInvoice')
        .delete();

      await SaleInvoice.query(trx).findByIds(saleInvoiceIds).delete();

      // Triggers `onSaleInvoiceDeleted` event.
      const onDeleteEventTrigger = oldSaleInvoices.map((oldSaleInvoice)=>{
        return this.eventPublisher.emitAsync(events.saleInvoice.onDeleted, {
            tenantId,
            oldSaleInvoice:oldSaleInvoice,
            saleInvoiceId:oldSaleInvoice.id,
            authorizedUser,
            trx,
          } as ISaleInvoiceDeletedPayload);
      })
      await Promise.all(onDeleteEventTrigger);
    });
  }
}
