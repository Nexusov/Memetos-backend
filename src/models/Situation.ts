import { Model } from 'objection';
import { User } from './User.js';

export class Situation extends Model {
  situationId!: number;
  joke!: string;
  language!: string;
  isNSFW!: boolean;

  userId!: number | null;
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
