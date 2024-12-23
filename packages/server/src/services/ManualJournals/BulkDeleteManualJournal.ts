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
   * @param ids 
   */
  public bulkDeleteManualJournal = async(tenantId:number,ids:Array<number>): Promise<{
    oldManualJournal: IManualJournal;
  }>=>{
    const {ManualJournal, ManualJournalEntry} = this.tenancy.models(tenantId);
    const oldManualJournal = await ManualJournal.query().findByIds(ids).throwIfNotFound();
     // Deletes the manual journal with associated transactions under unit-of-work envirement.
     return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {
      await ManualJournalEntry.query(trx)
        .whereIn('manualJournalId', ids)
        .delete();
      // Deletes the manual journal transaction.
      await ManualJournal.query(trx).findByIds(ids).delete();
      return { oldManualJournal };
    });
  }
}
