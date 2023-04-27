import type { FastifyInstance, FastifyReply } from 'fastify';
import { DiscordAuthRequest, discordAuthSchema } from './schemas.js';

import { DiscordAPIError, REST } from '@discordjs/rest';
import { RESTPostOAuth2AccessTokenResult, Routes } from 'discord-api-types/v10';
import qs from 'node:querystring';

const rest = new REST({ version: '10' });

export const AuthController = async (fastify: FastifyInstance) => {
  fastify.post('/discord', { schema: discordAuthSchema }, discordAuth);
};

async function discordAuth (this: FastifyInstance, request: DiscordAuthRequest, reply: FastifyReply) {
  const exchangeData = {
    client_id: this.config.DISCORD_CLIENT_ID,
    client_secret: this.config.DISCORD_CLIENT_SECRET,
    code: request.body.code,
    grant_type: 'authorization_code' as const,
    redirect_uri: `${this.config.DOMAIN}/auth/discord`
  };

  try {
    const tokenResponse = await rest.post(Routes.oauth2TokenExchange(), {
      body: qs.encode(exchangeData),
      passThroughBody: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      auth: false
    }) as RESTPostOAuth2AccessTokenResult;

    await reply.status(200).send({
      accessToken: tokenResponse.access_token
    });
  } catch (e) {
    if (e instanceof DiscordAPIError) {
      await reply.status(400).send({
        error: 'Bad Request',
        message: 'invalid "code" was provided',
        statusCode: 400
      });
      return;
    }

    throw e;
  }
}
