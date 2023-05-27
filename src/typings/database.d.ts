import knex from 'knex';
import {
  Card,
  DiscordConnection,
  Premium,
  Situation,
  User
} from '../models/index.ts';

interface DatabaseModels {
  Card: typeof Card;
  DiscordConnection: typeof DiscordConnection;
  Premium: typeof Premium;
  Situation: typeof Situation;
  User: typeof User;
}

declare module 'fastify' {
  interface FastifyInstance {
    knex: knex.Knex;
    models: DatabaseModels;

    decorate(property: 'knex', value: knex.Knex): FastifyInstance;
    decorate(property: 'models', value: DatabaseModels): FastifyInstance;

    config: NodeJS.ProcessEnv;
  }
}
