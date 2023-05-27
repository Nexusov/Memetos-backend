import { Model } from 'objection';
import { User } from './User.js';

export class Premium extends Model {
  premiumId!: string;
  subscribedAt!: Date;
  userId!: number;

  user?: User;

  static get tableName () {
    return 'premiums';
  }

  static get idColumn () {
    return 'premiumId';
  }

  static get relationMappings () {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'premiums.userId',
          to: 'users.userId'
        }
      }
    };
  }
}
