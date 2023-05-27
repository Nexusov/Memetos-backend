import { Model } from 'objection';

import { DiscordConnection } from './DiscordConnection.js';
import { Premium } from './Premium.js';
import { Card } from './Card.js';
import { Situation } from './Situation.js';

export class User extends Model {
  userId!: number;
  name!: string;
  email!: string;
  avatarUrl!: string;

  discordConnection?: DiscordConnection;
  cards?: Card[];
  situations?: Situation[];
  premium?: Premium;

  static get tableName () {
    return 'users';
  }

  static get idColumn () {
    return 'userId';
  }

  static get relationMappings () {
    return {
      discordConnection: {
        relation: Model.HasOneRelation,
        modelClass: DiscordConnection,
        join: {
          from: 'users.userId',
          to: 'discordConnections.discordId'
        }
      },
      cards: {
        relation: Model.HasManyRelation,
        modelClass: Card,
        join: {
          from: 'users.userId',
          to: 'cards.userId'
        }
      },
      situations: {
        relation: Model.HasManyRelation,
        modelClass: Situation,
        join: {
          from: 'users.userId',
          to: 'situations.userId'
        }
      },
      premium: {
        relation: Model.HasOneRelation,
        modelClass: DiscordConnection,
        join: {
          from: 'users.userId',
          to: 'premiums.userId'
        }
      }
    };
  }
}
