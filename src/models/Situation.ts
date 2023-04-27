import { Model } from 'objection';
import { User } from './User.js';

export class Situation extends Model {
  situationId!: bigint;
  joke!: string;
  language!: string;
  isNSFW!: boolean;

  userId!: bigint | null;
  author?: User;

  static get tableName () {
    return 'situations';
  }

  static get idColumn () {
    return 'situationId';
  }

  static get relationMappings () {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'situations.userId',
          to: 'users.userId'
        }
      }
    };
  }
}
