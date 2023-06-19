import type { Player } from './Player.js';
import type { ServerEvents, Card as GameCard, BestMeme } from './WebsocketEvents.js';
import { Card } from '../models/Card.js';

export interface LobbySettings {
  maximumUsers: number;
  roundsCount: number;
  cardsCount: number;
  voteDuration: number;
  chooseCardDuration: number;

  isNsfw: boolean;
  isAnonymousVotes: boolean;

  language: string;
}

type GameState = 'idle' | 'chooseCards' | 'voteCards' | 'end'

const wait = (ms = 3000) => new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export class Lobby {
  private _settings: LobbySettings = {
    maximumUsers: 7,
    roundsCount: 3,
    cardsCount: 5,
    voteDuration: 10,
    chooseCardDuration: 10,
    isNsfw: false,
    isAnonymousVotes: false,
    language: 'ru'
  };

  public readonly inviteCode: string;

  private ownerId: Player['userId'];
  private players: Player[] = [];

  private state: GameState = 'idle';
  private bestMeme: BestMeme | null = null;

  public constructor (ownerId: Player['userId'], inviteCode: string) {
    this.ownerId = ownerId;
    this.inviteCode = inviteCode;
  }

  public get owner () {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.players.find((player) => player.userId === this.ownerId)!;
  }

  public get settings () {
    return this._settings;
  }

  private get currentCards () {
    return this.players.map((p) => p.cards).flat();
  }

  private async broadcast (event: ServerEvents) {
    for (const player of this.players) {
      await player.sendEvent(event);
    }
  }

  public getLobbyInfo () {
    return {
      owner: this.owner,
      players: this.players.length,
      maxPlayers: this._settings.maximumUsers
    };
  }

  public async addPlayer (newPlayer: Player) {
    await this.broadcast({
      type: 'player_join',
      data: {
        userId: newPlayer.userId,
        avatarUrl: newPlayer.avatarUrl,
        name: newPlayer.name
      }
    });

    this.players.push(newPlayer);

    await newPlayer.sendEvent({
      type: 'lobby_info',
      data: {
        settings: this._settings,
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
    if (player.userId === this.ownerId) {
      for (const player of this.players) {
        player.disconnect();
      }

      this.players = [];
      this.state = 'end';

      return;
    }

    this.players = this.players.filter((p) => p.userId !== player.userId);
    await this.broadcast({
      type: 'player_leave',
      data: {
        userId: player.userId
      }
    });
  }

  public async kick (userId: string) {
    const player = this.players.find((u) => u.userId === userId);
    if (!player) return;

    await this.removePlayer(player);
    player.disconnect();
  }

  public async setSettings (settings: Partial<LobbySettings>) {
    this._settings = {
      ...this._settings,
      ...settings
    };

    await this.broadcast({
      type: 'set_settings',
      data: this._settings
    });
  }

  public async updateCards () {
    await this.broadcast({
      type: 'cards_update',
      data: this.players
        .filter((p) => p.selectedCard !== undefined)
        .map((p) => ({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          cardId: p.selectedCard!.cardId,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pictureUrl: p.selectedCard!.pictureUrl,
          userId: p.userId
        }))
    });
  }

  public async start () {
    await this.broadcast({
      type: 'start_game'
    });

    await wait(3000);

    const startCards = await Card.query()
      .select('cardId', 'pictureUrl')
      .orderByRaw('RANDOM()')
      .limit(this.players.length * this._settings.cardsCount);

    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      await player.addCards(...startCards.slice(i * this._settings.cardsCount, (i + 1) * this._settings.cardsCount));
    }

    const jokes = [
      'Когда пришёл на пару, а она уже закончилась',
      'Дедлайн сдачи работы - 10:00\nТы в 9:59',
      'Когда пришёл сдавать долги, а тебя отчислили',
      'Когда увидел цены на еду в столовой',
      'Когда учитель попросил дневник, а его опять съела собака',
      'Тот самый безработный друг, который зовет гулять в 8 утра в понедельник',
      'Твой друг, который вложил все деньги в криптовалюту, а она обвалилась',
      'Когда на семейных посиделках тебя просят сказать тост',
      'Когда услышал "Доставайте тетрадные листочки и ручку"',
      'Учитель раздает задания, а твой сосед-отличник не пришел на урок',
      'Когда проснулся в 6 утра в свой единственный выходной за месяц',
      'Когда единственный, кто за тобой бегает — это твой кот',
      'Когда родственники опять тебя спрашивают "Когда свадьба ?"',
      'Когда тебе задают серьезный вопрос, а ты делаешь вид, что не услышал',
      'Когда она пригласила тебя на чай и вы действительно пили чай',
      'Когда сильно устал на работе, а прошло только десять минут',
      'Лицо жены, когда ты знакомишь её со своей девушкой',
      'Когда дед опять рассказывает, как он добирался до школы в детстве',
      'Когда в больнице увидел как скандалят бабки',
      'Когда на вписке напился самым первым и делаешь вид, что с тобой всё нормально',
      'Когда отучился в универе за 300к в год, а теперь работаешь за 15к в месяц',
      'Когда на улице +30 и включили в офисе кондиционер, а бухгалтерша кричит, что ей дует',
      'Лицо бомжа, когда его посадили под домашний арест',
      'Когда мама тебя просит спеть что-нибудь перед родственниками',
      'Когда услышал, как пятиклассники обсуждают свои отношения',
      'Когда вызвал эконом, в приехал комфорт',
      'Когда лёг в 5:59, а вставать в 6:00',
      'Когда в детстве стоишь с мамой в очереди и она говорит стоять тут',
      'Когда в ресторане невкусно, но ты продолжаешь есть, так как заплатил за это',
      'Когда бабшука опять прислала тебе открытку в Ватсапе',
      'Когда сходил на митинг, а на утро слышишь стук в дверь',
      'Когда на кассе пробили товар без скидки'
    ];

    // Шафл массива методом Фишера — Йетса
    for (let i = jokes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [jokes[i], jokes[j]] = [jokes[j], jokes[i]];
    }

    for (let round = 0; round < 3; round++) {
      const joke = jokes[round];
      await this.broadcast({
        type: 'start_round',
        data: { joke }
      });

      await wait(this._settings.chooseCardDuration * 1000);

      await this.broadcast({
        type: 'start_voting'
      });

      await wait(this._settings.voteDuration * 1000);

      const cards: Pick<GameCard, 'voters' | 'cardId'>[] = [];
      for (const player of this.players) {
        if (!player.selectedCard) continue;
        const { selectedCard } = player;

        const voters = this.players
          .filter((voter) => voter.votedCard === selectedCard.cardId)
          .map((voter) => voter.userId);

        if (!this.bestMeme || this.bestMeme.votes < voters.length) {
          this.bestMeme = {
            joke,
            pictureUrl: selectedCard.pictureUrl,
            votes: voters.length,
            author: {
              avatarUrl: player.avatarUrl,
              name: player.name,
              userId: player.userId
            }
          };
        }

        cards.push({ voters, cardId: selectedCard.cardId });
        player.addMemePoints(voters.length);
      }

      await this.broadcast({
        type: 'vote_results',
        data: {
          players: this.players.map(({ userId, memePoints }) => ({ userId, memePoints })),
          cards
        }
      });

      await wait(5000);

      const newCards = await Card.query()
        .select('cardId', 'pictureUrl')
        .limit(this.players.length)
        .whereNotIn('cardId', this.currentCards.map((c) => c.cardId));

      for (let i = 0; i < this.players.length; i++) {
        const player = this.players[i];

        player.resetCards();
        await player.addCards(newCards[i]);
      }
    }

    if (this.bestMeme) {
      await this.broadcast({
        type: 'best_meme',
        data: this.bestMeme
      });
    }

    await this.broadcast({
      type: 'end_game',
      data: this.players.map(({ userId, memePoints }) => ({ userId, memePoints }))
    });
  }
}
