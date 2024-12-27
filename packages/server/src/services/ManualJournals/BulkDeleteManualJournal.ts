import { Service, Inject } from 'typedi';
import { Knex } from 'knex';
import {
  IManualJournal,
  IManualJournalDeletingPayload,
  IManualJournalEventDeletedPayload
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
   * Delete the given manual journals
   * @param tenantId
   * @param ids
   */
  public bulkDeleteManualJournal = async(tenantId:number, ids: number[]): Promise<{ oldManualJournal: IManualJournal[] }> => {
    const { ManualJournal, ManualJournalEntry } = this.tenancy.models(tenantId);

    // Start the transaction inside the UnitOfWork
    return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {
      // Fetch all the journals in a single query
      const oldManualJournal = await ManualJournal.query(trx)
        .whereIn('id', ids)
        .select()
        .throwIfNotFound();

      // Emit the "deleting" events concurrently for all journals
      const deletingEvents = oldManualJournal.map((oldManual) =>
        this.eventPublisher.emitAsync(events.manualJournals.onDeleting, {
          tenantId,
          oldManualJournal: oldManual,
          trx,
        } as IManualJournalDeletingPayload)
      );

      // Wait for all deleting events to be published
      await Promise.all(deletingEvents);

      // Delete associated entries and journals in bulk
      await ManualJournalEntry.query(trx)
        .whereIn('manualJournalId', ids)
        .delete();

      await ManualJournal.query(trx)
        .whereIn('id', ids)
        .delete();

      // Emit the "deleted" events concurrently for all journals
      const deletedEvents = oldManualJournal.map((oldManual) =>
        this.eventPublisher.emitAsync(events.manualJournals.onDeleted, {
          tenantId,
          manualJournalId: oldManual.id,
          oldManualJournal: oldManual,
          trx,
        } as IManualJournalEventDeletedPayload)
      );

      // Wait for all deleted events to be published
      await Promise.all(deletedEvents);

      // Return the deleted journals
      return { oldManualJournal };
    });
  }
}
