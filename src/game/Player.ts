import type { WebSocket } from 'ws';
import type { Lobby } from './Lobby.js';
import type { ClientEvents, ServerEvents } from './WebsocketEvents.js';
import type { Card } from '../models/Card.js';

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

  private _cards: Card[] = [];
  public get cards () {
    return this._cards;
  }

  private _memePoints = 0;

  private _selectedCard?: Card;
  public get selectedCard () {
    return this._selectedCard;
  }

  private _votedCard?: number;
  public get votedCard () {
    return this._votedCard;
  }

  public constructor ({ userId, name, avatarUrl }: PlayerInfo, socket: WebSocket, lobby: Lobby) {
    this.userId = userId;
    this.name = name;
    this.avatarUrl = avatarUrl;

    this.socket = socket;
    this.lobby = lobby;

    this.socket.on('message', async (data) => {
      const serialziedData = data.toString();
      const event = (JSON.parse(serialziedData) as unknown) as ClientEvents;

      await this.handleMessage(event);
    });

    this.socket.on('close', async () => {
      await this.onPlayerLeave();
    });
  }

  private async handleMessage (event: ClientEvents) {
    switch (event.type) {
      case 'disconnect': {
        await this.onPlayerLeave();
        break;
      }

      case 'set_settings': {
        if (!event.data) return;
        await this.lobby.setSettings(event.data);

        break;
      }

      case 'start': {
        // TODO: check for game state
        await this.lobby.start();
        break;
      }

      case 'kick': {
        if (!event.data) return;
        await this.lobby.kick(event.data.userId);

        break;
      }

      case 'choose_card': {
        if (!event.data) return;

        const { cardId } = event.data;
        const card = this._cards.find(card => card.cardId === cardId);
        if (!card) return;

        this._selectedCard = card;
        await this.lobby.updateCards();

        break;
      }

      case 'vote_card': {
        if (!event.data) return;

        this._votedCard = event.data.cardId;
        break;
      }

      case 'connect': {
        // had been already handled
        break;
      }

      default: {
        const neverCheck: never = event;
        throw new Error(neverCheck);
      }
    }
  }

  public disconnect () {
    try {
      this.socket.close();
    } catch {}
  }

  private async onPlayerLeave () {
    await this.lobby.removePlayer(this);

    if (this.socket.readyState === 1) {
      this.socket.close();
    }
  }

  public async addCards (...cards: Card[]) {
    this._cards.push(...cards);
    await this.sendEvent({
      type: 'set_user_cards',
      data: this._cards.map((card) => ({ cardId: card.cardId, pictureUrl: card.pictureUrl }))
    });
  }

  public sendEvent (event: ServerEvents): Promise<void> {
    return new Promise((resolve) => {
      this.socket.send(JSON.stringify(event), () => {
        resolve();
      });
    });
  }

  public addMemePoints (points: number) {
    this._memePoints += points;
  }

  public resetCards () {
    this._cards = this._cards.filter((card) => card.cardId !== this._selectedCard?.cardId);

    this._selectedCard = undefined;
    this._votedCard = undefined;
  }

  get memePoints () {
    return this._memePoints;
  }
}
