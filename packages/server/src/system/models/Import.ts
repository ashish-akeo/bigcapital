import { Model, ModelObject } from 'objection';
import SystemModel from './SystemModel';
import { error } from 'winston';

export class Import extends SystemModel {
  resource: string;
  tenantId: number;
  mapping!: string;
  columns!: string;
  params!: string;

  /**
   * Table name.
   */
  static get tableName() {
    return 'imports';
  }

  /**
   * Virtual attributes.
   */
  static get virtualAttributes() {
    return ['mappingParsed'];
  }

  /**
   * Timestamps columns.
   */
  get timestamps() {
    return ['createdAt', 'updatedAt'];
  }

  /**
   * Detarmines whether the import is mapped.
   * @returns {boolean}
   */
  public get isMapped() {
    return Boolean(this.mapping);
  }

  public get columnsParsed() {
    try {
      return JSON.parse(this.columns);
    } catch {
      return [];
    }
  }

  public get paramsParsed() {
    try {
      return JSON.parse(this.params);
    } catch {
      return [];
    }
  }

  public get mappingParsed() {
    try {
      console.log("bigcapital\packages\server\src\system\models\Import.ts:mappingParsed",this.mapping);
      console.log("Type of json in bigcapital\packages\server\src\system\models\Import.ts:mappingParsed at 59 line no. ",typeof(this.mapping));
      return JSON.parse(this.mapping);
      
    } catch(error) {
      console.log("bigcapital\packages\server\src\system\models\Import.ts:mappingParsed:catch",error)
      return [
        { to: 'name', from: 'Account Name', group: null },
        { to: 'description', from: 'Description', group: null },
        { to: 'code', from: 'Account Code', group: null },
        { to: 'accountType', from: 'Type', group: null },
        { to: 'active', from: 'Active', group: null },
      ]
    }
  }

  /**
   * Relationship mapping.
   */
  static get relationMappings() {
    const Tenant = require('system/models/Tenant');

    return {
      /**
       * System user may belongs to tenant model.
       */
      tenant: {
        relation: Model.BelongsToOneRelation,
        modelClass: Tenant.default,
        join: {
          from: 'imports.tenantId',
          to: 'tenants.id',
        },
      },
    };
  }
}

export type ImportShape = ModelObject<Import>;
