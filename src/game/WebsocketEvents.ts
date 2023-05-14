import type { LobbySettings } from './Lobby.js';
import type { PlayerInfo } from './Player.js';

export interface WebsocketMessage<T extends string = string, D = null> {
  type: T;
  data?: D;
}

export type ClientEvents =
  WebsocketMessage<'connect', PlayerInfo & { inviteCode: string }> |
  WebsocketMessage<'disconnect'> |

  WebsocketMessage<'choose_card', { cardId: number }> |
  WebsocketMessage<'vote_card', { cardId: number }> |

  WebsocketMessage<'start'> |
  WebsocketMessage<'kick', Pick<PlayerInfo, 'userId'>> |
  WebsocketMessage<'set_settings', Partial<LobbySettings>>

export type ServerEvents =
  WebsocketMessage<'lobby_info', { settings: LobbySettings, players: PlayerInfo[], ownerId: PlayerInfo['userId'] }> |

  WebsocketMessage<'player_join', PlayerInfo> |
  WebsocketMessage<'player_leave', Pick<PlayerInfo, 'userId'>> |

  WebsocketMessage<'start_game'> |
  WebsocketMessage<'end_game'> |

  WebsocketMessage<'start_round', { joke: string }> |
  WebsocketMessage<'cards_update', Pick<PlayerInfo, 'userId'>> |

  WebsocketMessage<'start_voting'> |
  WebsocketMessage<'vote_results', Array<Pick<PlayerInfo, 'userId'> & { memePoints: number }>> |

  WebsocketMessage<'set_settings', Partial<LobbySettings>>
