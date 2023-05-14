import type { WebSocket } from 'ws';
import type { Lobby } from './Lobby.js';
import type { ClientEvents, ServerEvents } from './WebsocketEvents.js';

export interface PlayerInfo {
  userId: string;
  name: string;
  avatarUrl: string;
}

export class Player {
  public readonly userId: PlayerInfo['userId'];
  public readonly name: PlayerInfo['name'];
  public readonly avatarUrl: PlayerInfo['avatarUrl'];

  private lobby: Lobby;
  private socket: WebSocket;

  private gameState: unknown = {
    cardId: 123
  };

  public constructor ({ userId, name, avatarUrl }: PlayerInfo, socket: WebSocket, lobby: Lobby) {
    this.userId = userId;
    this.name = name;
    this.avatarUrl = avatarUrl;

    this.socket = socket;
    this.lobby = lobby;

    this.socket.on('message', async (data) => {
      const serialziedData = data.toString();
      const event = (JSON.parse(serialziedData) as unknown) as ClientEvents;

      if (event.type !== 'disconnect') return;
      await this.onPlayerLeave();
    });

    this.socket.on('close', async () => {
      await this.onPlayerLeave();
    });
  }

  private async onPlayerLeave () {
    await this.lobby.removePlayer(this);

    if (this.socket.readyState === 1) {
      this.socket.close();
    }
  }

  public sendEvent (event: ServerEvents): Promise<void> {
    return new Promise((resolve) => {
      this.socket.send(JSON.stringify(event), () => {
        resolve();
      });
    });
  }

  get memePoints () {
    return 0;
  }
}
