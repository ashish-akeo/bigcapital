import { Service, Inject } from 'typedi';
import moment from 'moment';
import { Knex } from 'knex';
import {
  IManualJournal,
  IManualJournalPublishingPayload,
  IManualJournalEventPublishedPayload,
} from '@/interfaces';
import TenancyService from '@/services/Tenancy/TenancyService';
import events from '@/subscribers/events';

import UnitOfWork from '@/services/UnitOfWork';
import { EventPublisher } from '@/lib/EventPublisher/EventPublisher';
import { CommandManualJournalValidators } from './CommandManualJournalValidators';
import { Request } from 'express';

@Service()
export class BulkPublishManualJournal {
  @Inject()
  private tenancy: TenancyService;

  @Inject()
  private eventPublisher: EventPublisher;

  @Inject()
  private uow: UnitOfWork;

  @Inject()
  private validator: CommandManualJournalValidators;

  /**
   * Authorize the manual journal publishing.
   * @param {number} tenantId
   * @param {IManualJournal} oldManualJournal
   */
  private authorize = (tenantId: number, oldManualJournal: IManualJournal) => {
    // Validate the manual journal is not published.
    this.validator.validateManualJournalIsNotPublished(oldManualJournal);
  };

  /**
   * Publishes the given bulk of manual journals.
   * @param {Number} tenantId 
   * @param {Array<number>} ids 
   * @returns {Promise<void>}
   */
  public async publishBulkManualJournal(
    tenantId: number,
    ids: number[],
  ): Promise<void> {
    const { ManualJournal } = this.tenancy.models(tenantId);

    // Fetch the manual journals in bulk at once
    const oldManualJournals = await ManualJournal.query()
      .whereIn('id', ids)
      .throwIfNotFound();

    // Authorize the manual journal publishing for each journal
    oldManualJournals.forEach((oldManualJournal) => {
      this.authorize(tenantId, oldManualJournal);
    });

    // Start the transaction to handle everything atomically
    return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {
      // Emit the 'onPublishing' events concurrently for all journals
      const publishingEvents = oldManualJournals.map((oldManualJournal) =>
        this.eventPublisher.emitAsync(events.manualJournals.onPublishing, {
          oldManualJournal,
          trx,
          tenantId,
        } as IManualJournalPublishingPayload)
      );
      await Promise.all(publishingEvents);

      // Update all journals to be marked as published in bulk
      await ManualJournal.query(trx)
        .whereIn('id', ids)
        .patch({
          publishedAt: moment().toMySqlDateTime(),
        });

      // Fetch all manual journals with their entries in bulk after modification
      const updatedManualJournals = await ManualJournal.query(trx)
        .whereIn('id', ids)
        .withGraphFetched('entries');

      // Emit the 'onPublished' events concurrently for all journals
      const publishedEvents = updatedManualJournals.map((manualJournal) =>
        this.eventPublisher.emitAsync(events.manualJournals.onPublished, {
          tenantId,
          manualJournal,
          manualJournalId: manualJournal.id,
          oldManualJournal: oldManualJournals.find(
            (journal) => journal.id === manualJournal.id
          ),
          trx,
        } as IManualJournalEventPublishedPayload)
      );

      // Wait for all 'onPublished' events to be processed
      await Promise.all(publishedEvents);
    });
  }
}
