import { Service, Inject } from 'typedi';
import {
  IManualJournalDTO,
  IManualJournalsFilter,
  ISystemUser,
} from '@/interfaces';
import { CreateManualJournalService } from './CreateManualJournal';
import { DeleteManualJournal } from './DeleteManualJournal';
import { EditManualJournal } from './EditManualJournal';
import { PublishManualJournal } from './PublishManualJournal';
import { GetManualJournals } from './GetManualJournals';
import { GetManualJournal } from './GetManualJournal';
import { BulkPublishManualJournal } from './BulkPublishManualJournal';
import { BulkDeleteManualJournal } from './BulkDeleteManualJournal';
import { Request } from 'express';

@Service()
export class ManualJournalsApplication {
  @Inject()
  private createManualJournalService: CreateManualJournalService;

  @Inject()
  private editManualJournalService: EditManualJournal;

  @Inject()
  private deleteManualJournalService: DeleteManualJournal;

  @Inject()
  private publishManualJournalService: PublishManualJournal;

  @Inject()
  private getManualJournalsService: GetManualJournals;

  @Inject()
  private getManualJournalService: GetManualJournal;

  @Inject()
  private BulkPublishManualJournal :BulkPublishManualJournal

  @Inject()
  private BulkDeleteManualJournal :BulkDeleteManualJournal

  /**
   * Make journal entries.
   * @param   {number} tenantId
   * @param   {IManualJournalDTO} manualJournalDTO
   * @param   {ISystemUser} authorizedUser
   * @returns {Promise<IManualJournal>}
   */
  public createManualJournal = (
    tenantId: number,
    manualJournalDTO: IManualJournalDTO,
    authorizedUser: ISystemUser
  ) => {
    return this.createManualJournalService.makeJournalEntries(
      tenantId,
      manualJournalDTO,
      authorizedUser
    );
  };

  /**
   * Edits jouranl entries.
   * @param {number} tenantId
   * @param {number} manualJournalId
   * @param {IMakeJournalDTO} manualJournalDTO
   * @param {ISystemUser} authorizedUser
   */
  public editManualJournal = (
    tenantId: number,
    manualJournalId: number,
    manualJournalDTO: IManualJournalDTO,
    authorizedUser: ISystemUser
  ) => {
    return this.editManualJournalService.editJournalEntries(
      tenantId,
      manualJournalId,
      manualJournalDTO,
      authorizedUser
    );
  };

  /**
   * Deletes the given manual journal
   * @param  {number} tenantId
   * @param  {number} manualJournalId
   * @return {Promise<void>}
   */
  public deleteManualJournal = (tenantId: number, manualJournalId: number) => {
    return this.deleteManualJournalService.deleteManualJournal(
      tenantId,
      manualJournalId
    );
  };

  /**
   * Publish the given manual journal.
   * @param {number} tenantId - Tenant id.
   * @param {number} manualJournalId - Manual journal id.
   */
  public publishManualJournal = (tenantId: number, manualJournalId: number) => {
    return this.publishManualJournalService.publishManualJournal(
      tenantId,
      manualJournalId
    );
  };
  public publishBulkManualJournal = (tenantId:number, req:any) =>
  {
    return this.BulkPublishManualJournal.publishBulkManualJournal(
      tenantId,
      req
    )
  }
  public buldDeteteManualJournal = (tenantId :number,req:any)=>{
    return this.BulkDeleteManualJournal.bulkDeleteManualJournal(
      tenantId,
      req
    )
  }

  /**
   * Retrieves the specific manual journal.
   * @param   {number} tenantId
   * @param   {number} manualJournalId
   * @returns
   */
  public getManualJournal = (tenantId: number, manualJournalId: number) => {
    return this.getManualJournalService.getManualJournal(
      tenantId,
      manualJournalId
    );
  };

  /**
   * Retrieves the paginated manual journals.
   * @param {number} tenantId
   * @param {IManualJournalsFilter} filterDTO
   * @returns
   */
  public getManualJournals = (
    tenantId: number,
    filterDTO: IManualJournalsFilter
  ) => {
    return this.getManualJournalsService.getManualJournals(tenantId, filterDTO);
  };
}
