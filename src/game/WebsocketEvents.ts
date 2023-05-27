import type { LobbySettings } from './Lobby.js';
import type { Player, PlayerInfo } from './Player.js';

export interface WebsocketMessage<T extends string = string, D = null> {
  type: T;
  data?: D;
}

export interface Card {
  cardId: number
  pictureUrl: string
  userId: Player['userId']
  voters: Array<Player['userId']>
}

export type ClientEvents =
  WebsocketMessage<'connect', PlayerInfo & { inviteCode: string }> |
  WebsocketMessage<'disconnect'> |

  WebsocketMessage<'choose_card', { cardId: number }> |
  WebsocketMessage<'vote_card', { cardId: number }> |

  WebsocketMessage<'start'> |
  WebsocketMessage<'kick', Pick<PlayerInfo, 'userId'>> |
  WebsocketMessage<'set_settings', Partial<LobbySettings>>

interface VoteResults {
  players: Required<Pick<Player, 'userId' | 'memePoints'>>[]
  cards: Pick<Card, 'cardId' | 'voters'>[]
}

export type ServerEvents =
  WebsocketMessage<'lobby_info', { settings: LobbySettings, players: PlayerInfo[], ownerId: string }> |

  WebsocketMessage<'player_join', PlayerInfo> |
  WebsocketMessage<'player_leave', Pick<PlayerInfo, 'userId'>> |

  WebsocketMessage<'start_game'> |
  WebsocketMessage<'end_game', Required<Pick<Player, 'userId' | 'memePoints'>>[]> |

  WebsocketMessage<'start_round', { joke: string }> |
  WebsocketMessage<'cards_update', Pick<Card, 'userId' | 'cardId' | 'pictureUrl'>[]> |
  WebsocketMessage<'set_user_cards', Pick<Card, 'cardId' | 'pictureUrl'>[]> |

  WebsocketMessage<'start_voting'> |
  WebsocketMessage<'vote_results', VoteResults> |

  WebsocketMessage<'set_settings', Partial<LobbySettings>>
