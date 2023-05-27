import { Model } from 'objection';
import { User } from './User.js';

export class Card extends Model {
  cardId!: number;
  pictureUrl!: string;
  isNsfw!: boolean;

  userId!: number | null;
  author?: User;

  static get tableName () {
    return 'cards';
  }

  static get idColumn () {
    return 'cardId';
  }

  static get relationMappings () {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'cards.userId',
          to: 'users.userId'
        }
      }
    };
  }
}
