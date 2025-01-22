import { Inject, Service } from 'typedi';
import { Knex } from 'knex';
import {
  IPaymentReceivedDeletedPayload,
  IPaymentReceivedDeletingPayload,
  ISystemUser,
} from '@/interfaces';
import UnitOfWork from '@/services/UnitOfWork';
import HasTenancyService from '@/services/Tenancy/TenancyService';
import events from '@/subscribers/events';
import { EventPublisher } from '@/lib/EventPublisher/EventPublisher';

@Service()
export class BulkDeletePaymentReceived {
  @Inject()
  private eventPublisher: EventPublisher;

  @Inject()
  private tenancy: HasTenancyService;

  @Inject()
  private uow: UnitOfWork;

  /**
   * Deletes the given payment receive with associated entries
   * and journal transactions.
   * -----
   * - Deletes the payment receive transaction.
   * - Deletes the payment receive associated entries.
   * - Deletes the payment receive associated journal transactions.
   * - Revert the customer balance.
   * - Revert the payment amount of the associated invoices.
   * @async
   * @param {number} tenantId - Tenant id.
   * @param {Integer} paymentReceiveId - Payment receive id.
   * @param {IPaymentReceived} paymentReceive - Payment receive object.
   */
  public async bulkDeletePaymentReceive(
    tenantId: number,
    paymentReceiveIds: Array<number>,
    authorizedUser: ISystemUser
  ) {
    const { PaymentReceive, PaymentReceiveEntry } =
      this.tenancy.models(tenantId);

    // Retreive payment receive or throw not found service error.
    const oldPaymentsReceive = await PaymentReceive.query()
      .withGraphFetched('entries')
      .findByIds(paymentReceiveIds)
      .throwIfNotFound();

    // Delete payment receive transaction and associate transactions under UOW env.
    return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {
      // Triggers `onPaymentReceiveDeleting` event.
    const onDeleteEvent = oldPaymentsReceive.map((oldPaymentReceive)=>{
    return this.eventPublisher.emitAsync(events.paymentReceive.onDeleting, {
            tenantId,
            oldPaymentReceive,
            trx,
          } as IPaymentReceivedDeletingPayload);
       })
      await Promise.all(onDeleteEvent);
      
      // Deletes the payment receive associated entries.
      await PaymentReceiveEntry.query(trx)
        .whereIn('payment_receive_id', paymentReceiveIds)
        .delete();

      // Deletes the payment receive transaction.
      await PaymentReceive.query(trx).findByIds(paymentReceiveIds).delete();

      // Triggers `onPaymentReceiveDeleted` event.
      const onDeletedEvent = oldPaymentsReceive.map((oldPaymentReceive)=>{
        return this.eventPublisher.emitAsync(events.paymentReceive.onDeleted, {
            tenantId,
            paymentReceiveId:oldPaymentReceive.id,
            oldPaymentReceive,
            authorizedUser,
            trx,
          } as IPaymentReceivedDeletedPayload);
      })
      await Promise.all(onDeletedEvent);
    });
  }
}
