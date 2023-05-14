import type { FastifyInstance, FastifyReply } from 'fastify';
import type { RawData } from 'ws';

import type { ClientEvents } from './WebsocketEvents.js';
import {
  CreateGameRequest,
  createGameSchema,
  getLobbySchema,
  GetLobbyRequest
} from './schemas.js';

import { Lobby } from './Lobby.js';
import { Player } from './Player.js';

const lobbies = new Map<string, Lobby>();

const generateLobbyId = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;

  return Array(length).fill(null).map(() => characters[Math.floor(Math.random() * charactersLength)]).join('');
};

export const GameController = async (fastify: FastifyInstance) => {
  fastify.get('/lobby', { schema: getLobbySchema }, getLobby);
  fastify.post('/create', { schema: createGameSchema }, createLobby);

  fastify.get('/game', { websocket: true }, (connection) => {
    const connectHandler = async (data: RawData) => {
      const serialziedData = data.toString();
      const event = (JSON.parse(serialziedData) as unknown) as ClientEvents;

      if (event.type !== 'connect' || !event.data) return;

      const lobby = lobbies.get(event.data.inviteCode);
      if (!lobby) {
        connection.socket.close();
        return;
      }

      const player = new Player(event.data, connection.socket, lobby);
      await lobby.addPlayer(player);

      connection.socket.off('message', connectHandler);
    };

    connection.socket.on('message', connectHandler);
  });
};

async function createLobby (this: FastifyInstance, request: CreateGameRequest, reply: FastifyReply) {
  const inviteCode = generateLobbyId(6);

  const lobby = new Lobby(request.body.userId, inviteCode);
  lobbies.set(inviteCode, lobby);

  await reply.status(200).send({
    inviteCode
  });
}

async function getLobby (this: FastifyInstance, request: GetLobbyRequest, reply: FastifyReply) {
  const lobby = lobbies.get(request.query.invite);

  if (!lobby) {
    await reply.status(404).send({
      error: 'Not Found',
      message: 'unknown lobby',
      statusCode: 404
    });

    return;
  }

  await reply.status(200)
    .send(lobby.getLobbyInfo());
}
