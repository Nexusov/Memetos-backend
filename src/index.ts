import Fastify, { FastifyInstance } from 'fastify';

import websocket from '@fastify/websocket';
import fastifyJwt from '@fastify/jwt';
import fastifyEnv from '@fastify/env';
import cors from '@fastify/cors';

import knex from 'knex';
import { Model } from 'objection';

import console from 'node:console';

import {
  Card,
  DiscordConnection,
  Premium,
  Situation,
  User
} from './models/index.js';

import { AuthController } from './auth/index.js';
import { GameController } from './game/index.js';

const enviromentSchema = {
  type: 'object',

  properties: {
    PORT: { type: 'string', default: '3000' },
    DOMAIN: { type: 'string' },

    DISCORD_CLIENT_ID: { type: 'string' },
    DISCORD_CLIENT_SECRET: { type: 'string' },

    DATABASE_CONNECTION: { type: 'string' },
    JWT_SECRET: { type: 'string' }
  },

  required: [
    'DOMAIN',
    'JWT_SECRET',
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DATABASE_CONNECTION'
  ]
};

const initAuth = async (fastify: FastifyInstance) => {
  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET
  });
};

const connectToDatabase = async (fastify: FastifyInstance) => {
  const knexClient = knex.knex({
    client: 'pg',
    connection: fastify.config.DATABASE_CONNECTION
  });

  Model.knex(knexClient);

  fastify.decorate('knex', knexClient);
  fastify.decorate('models', {
    Card,
    DiscordConnection,
    Premium,
    Situation,
    User
  });
};

const main = async () => {
  const fastify = Fastify();

  await fastify.register(fastifyEnv, { schema: enviromentSchema });
  await fastify.register(websocket);
  await fastify.register(cors, { origin: '*' });

  await initAuth(fastify);
  await connectToDatabase(fastify);

  fastify
    .register(AuthController, { prefix: '/api/auth' })
    .register(GameController, { prefix: '/api/game' });

  const PORT = parseInt(fastify.config.PORT);
  await fastify.listen({
    port: PORT
  });
};

try {
  await main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
