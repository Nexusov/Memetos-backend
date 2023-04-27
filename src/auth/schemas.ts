import { FastifyRequest, FastifySchema } from 'fastify';

export const discordAuthSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      code: {
        type: 'string'
      }
    },
    required: ['code']
  },

  response: {
    200: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' }
      },
      required: ['accessToken']
    },

    400: {
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

export type DiscordAuthRequest = FastifyRequest<{
  Body: {
    code: string;
  }
}>;
