import { FastifyRequest, FastifySchema } from 'fastify';
import { PlayerInfo } from './Player.js';

export const createGameSchema: FastifySchema = {
  body: {
    type: 'object',

    properties: {
      userId: { type: 'string' }
    },

    required: ['userId']
  },

  response: {
    200: {
      type: 'object',

      properties: {
        inviteCode: { type: 'string' }
      },

      required: ['inviteCode']
    }
  }
};

export type CreateGameRequest = FastifyRequest<{
  Body: {
    userId: PlayerInfo['userId'];
  }
}>;

export const getLobbySchema: FastifySchema = {
  querystring: {
    type: 'object',

    properties: {
      invite: { type: 'string' }
    },
    required: ['inviteCode']
  },

  response: {
    200: {
      type: 'object',

      properties: {
        owner: {
          type: 'object',

          properties: {
            userId: { type: 'string' },
            name: { type: 'string' },
            avatarUrl: { type: 'string' }
          },

          required: ['userId', 'name', 'avatarUrl']
        },

        players: { type: 'number' },
        maxPlayers: { type: 'number' }
      },

      required: ['owner', 'players', 'maxPlayers']
    },
    404: {
      type: 'object',

      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        statusCode: { type: 'number' }
      },

      required: ['error', 'message', 'statusCode']
    }
  }
};

export type GetLobbyRequest = FastifyRequest<{
  Querystring: {
    invite: string;
  }
}>;
