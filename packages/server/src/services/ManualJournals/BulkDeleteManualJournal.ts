import { Service, Inject } from 'typedi';
import { Knex } from 'knex';
import {
  IManualJournal,
  IManualJournalEventDeletedPayload,
  IManualJournalDeletingPayload,
} from '@/interfaces';
import TenancyService from '@/services/Tenancy/TenancyService';
import events from '@/subscribers/events';
import UnitOfWork from '@/services/UnitOfWork';
import { EventPublisher } from '@/lib/EventPublisher/EventPublisher';

@Service()
export class BulkDeleteManualJournal {
  @Inject()
  private tenancy: TenancyService;

  @Inject()
  private eventPublisher: EventPublisher;

  @Inject()
  private uow: UnitOfWork;

  /**
   * Delete the given manual
   * @param tenantId 
   * @param req 
   */
  public bulkDeleteManualJournal = async(tenantId:number,req:any): Promise<{
    oldManualJournal: IManualJournal;
  }>=>{
    const {ManualJournal, ManualJournalEntry} = this.tenancy.models(tenantId);
    const oldManualJournal = await ManualJournal.query().findByIds(req.ids).throwIfNotFound();
     // Deletes the manual journal with associated transactions under unit-of-work envirement.
     return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {
      // Triggers `onManualJournalDeleting` event.
      // await this.eventPublisher.emitAsync(events.manualJournals.onDeleting, {
      //   tenantId,
      //   oldManualJournal,
      //   trx,
      // } as IManualJournalDeletingPayload);
      // Deletes the manual journal entries.
      await ManualJournalEntry.query(trx)
        .whereIn('manualJournalId', req.ids)
        .delete();
      // Deletes the manual journal transaction.
      await ManualJournal.query(trx).findByIds(req.ids).delete();
      // Triggers `onManualJournalDeleted` event.
      const manualJournalId = req.ids
      // await this.eventPublisher.emitAsync(events.manualJournals.onDeleted, {
      //   tenantId,
      //   manualJournalId,
      //   oldManualJournal,
      //   trx,
      // } as IManualJournalEventDeletedPayload);

      return { oldManualJournal };
    });

  }
}
