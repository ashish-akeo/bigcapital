import { Service, Inject } from 'typedi';
import { Knex } from 'knex';
import { EventPublisher } from '@/lib/EventPublisher/EventPublisher';
import HasTenancyService from '@/services/Tenancy/TenancyService';
import UnitOfWork from '@/services/UnitOfWork';
import { IAccountEventDeletedPayload, IAccount } from '@/interfaces';
import events from '@/subscribers/events';
import { CommandAccountValidators } from './CommandAccountValidators';
import { ERRORS } from './constants';

@Service()
export class DeleteBulkAccount {
  @Inject()
  private tenancy: HasTenancyService;

  @Inject()
  private eventPublisher: EventPublisher;

  @Inject()
  private uow: UnitOfWork;

  @Inject()
  private validator: CommandAccountValidators;

  /**
   * Authorize account delete.
   * @param {number} accountId - Account id.
   */
  private authorize = async (
    oldAccount: IAccount[]
  ) => {
    // Throw error if the account was predefined.
    this.validator.throwErrorIfAccountPredefined(oldAccount);
    
  };

  /**
   * Unlink the given parent account with children accounts.
   * @param {number} tenantId -
   * @param {number|number[]} parentAccountId -
   */
  private async unassociateChildrenAccountsFromParent(
    tenantId: number,
    parentAccountId: number | number[],
    trx?: Knex.Transaction
  ) {
    const { Account } = this.tenancy.models(tenantId);
    const accountsIds = Array.isArray(parentAccountId)
      ? parentAccountId
      : [parentAccountId];
    await Account.query(trx)
      .whereIn('parent_account_id', accountsIds)
      .patch({ parent_account_id: null });
  }

  

  /**
   * Deletes the account from the storage.
   * @param {number} tenantId
   * @param {Array<number>} accountIds
   */
  public deleteBulkAccounts = async (
    tenantId: number,
    accountIds: Array<number>
  ): Promise<void> => {
    const { Account } = this.tenancy.models(tenantId);

    // Retrieve account or not found service error.
    const oldAccount = await Account.query().findByIds(accountIds);

    const checkRelationPromises = accountIds.map(accountId => {
        return Account.query()
        .findById(accountId)
        .throwIfNotFound()
        .queryAndThrowIfHasRelations({
            type: ERRORS.ACCOUNT_HAS_ASSOCIATED_TRANSACTIONS,
            excludeRelations: ['uncategorizedTransactions', 'plaidItem']
        });
    });  
    await Promise.all(checkRelationPromises);   
    // Authorize before deleting account.
    await this.authorize(oldAccount);
  
    // Deletes the account and associated transactions under UOW environment.
    return this.uow.withTransaction(tenantId, async (trx: Knex.Transaction) => {

      // Triggers `onAccountDelete` event.
    const deleteAccounts = oldAccount.map((oldAccount) => {
        return this.eventPublisher.emitAsync(events.accounts.onDelete, {
          trx,
          oldAccount,
          tenantId,
        } as IAccountEventDeletedPayload);
    });  
      await Promise.all(deleteAccounts);
  
      // Unlink the parent account from children accounts.
    await this.unassociateChildrenAccountsFromParent(
        tenantId,
        accountIds,
        trx
    );
    // Deletes account by the given id.
    await Account.query(trx).whereIn('id', accountIds).delete();
        // Triggers `onAccountDeleted` event.
      const deletedEvents = oldAccount.map((oldAccount) => {
        return this.eventPublisher.emitAsync(events.accounts.onDeleted, {
          tenantId,
          accountId: oldAccount.id,
          oldAccount,
          trx,
        } as IAccountEventDeletedPayload);
      });
      await Promise.all(deletedEvents);
    });
  };

}
