import { Model } from 'objection';
import { User } from './User.js';

export class DiscordConnection extends Model {
  discordId!: bigint;
  userId!: bigint;
  refreshToken!: string;

  user?: User;

  static get tableName () {
    return 'discordConnections';
  }

  static get idColumn () {
    return 'discordId';
  }

  static get relationMappings () {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'discordConnections.userId',
          to: 'users.userId'
        }
      }
    };
  }
}
