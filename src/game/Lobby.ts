import type { Player } from './Player.js';

export interface LobbySettings {
  maximumUsers: number;
  cardsCount: number;
  voteDuration: number;
  chooseCardDuration: number;

  isNsfw: boolean;
  isAnonymousVotes: boolean;

  language: string;
}

type GameState = 'idle' | 'chooseCards' | 'voteCards' | 'end'

export class Lobby {
  private settings: LobbySettings = {
    maximumUsers: 7,
    cardsCount: 5,
    voteDuration: 30,
    chooseCardDuration: 60,
    isNsfw: false,
    isAnonymousVotes: false,
    language: 'ru'
  };

  public readonly inviteCode: string;

  private ownerId: Player['userId'];
  private players: Player[] = [];

  private state: GameState = 'idle';

  public constructor (ownerId: Player['userId'], inviteCode: string) {
    this.ownerId = ownerId;
    this.inviteCode = inviteCode;
  }

  public get owner () {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.players.find((player) => player.userId === this.ownerId)!;
  }

  public getLobbyInfo () {
    return {
      owner: this.owner,
      players: this.players.length,
      maxPlayers: this.settings.maximumUsers
    };
  }

  public async addPlayer (newPlayer: Player) {
    for (const player of this.players) {
      await player.sendEvent({
        type: 'player_join',
        data: {
          userId: newPlayer.userId,
          avatarUrl: newPlayer.avatarUrl,
          name: newPlayer.name
        }
      });
    }

    this.players.push(newPlayer);

    await newPlayer.sendEvent({
      type: 'lobby_info',
      data: {
        settings: this.settings,
        players: this.players.map((player) => ({
          userId: player.userId,
          avatarUrl: player.avatarUrl,
          name: player.name
        })),
        ownerId: this.ownerId
      }
    });
  }

  public async removePlayer (player: Player) {
    this.players = this.players.filter((p) => p.userId !== player.userId);
    for (const p of this.players) {
      await p.sendEvent({
        type: 'player_leave',
        data: {
          userId: player.userId
        }
      });
    }
  }
}
