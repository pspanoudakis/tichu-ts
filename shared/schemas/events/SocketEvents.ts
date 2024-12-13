import { ERROR_TYPES } from "../API";
import {
    ClientEventType,
    GiveDragonEvent,
    JoinGameEvent,
    PlaceBetEvent,
    PlayCardsEvent,
    RequestCardEvent,
    SendMessageEvent,
    TradeCardsEvent
} from "./ClientEvents";
import {
    AllCardsRevealedEvent,
    BetPlacedEvent,
    BombDroppedEvent,
    CardRequestedEvent,
    CardsPlayedEvent,
    CardsTradedEvent,
    ClientStateSyncEvent,
    DragonGivenEvent,
    ErrorEvent,
    GameEndedEvent,
    GameRoundEndedEvent,
    GameRoundStartedEvent,
    MessageSentEvent,
    PlayerJoinedEvent,
    PlayerLeftEvent,
    ServerEventType,
    TableRoundEndedEvent,
    TableRoundStartedEvent,
    TurnPassedEvent,
    WaitingForJoinEvent
} from "./ServerEvents";

type NoDataEmitter = () => void;
type NoDataEmitterWithAck = (ackFn: () => void) => void;
type Emitter<T> = (eventData: T) => void;
type EmitterWithAck<T> = (eventData: T, ackFn: () => void) => void;

export type ClientEvents = {
    [ClientEventType.DROP_BOMB]: NoDataEmitter,
    [ClientEventType.GIVE_DRAGON]: Emitter<GiveDragonEvent>,
    [ClientEventType.JOIN_GAME]: Emitter<JoinGameEvent>,
    [ClientEventType.PASS_TURN]: NoDataEmitter,
    [ClientEventType.PLACE_BET]: Emitter<PlaceBetEvent>,
    [ClientEventType.PLAY_CARDS]: Emitter<PlayCardsEvent>,
    [ClientEventType.RECEIVE_TRADE]: NoDataEmitterWithAck,
    [ClientEventType.REQUEST_CARD]: Emitter<RequestCardEvent>,
    [ClientEventType.REVEAL_ALL_CARDS]: NoDataEmitter,
    [ClientEventType.SEND_MESSAGE]: Emitter<SendMessageEvent>,
    [ClientEventType.START_GAME]: NoDataEmitterWithAck,
    [ClientEventType.TRADE_CARDS]: EmitterWithAck<TradeCardsEvent>,
};

export type ServerEvents = {
    connect: NoDataEmitter;
    disconnect: (reason: any, description?: any) => void;
    [ERROR_TYPES.INTERNAL_ERROR]: Emitter<ErrorEvent>;
    [ERROR_TYPES.VALIDATION_ERROR]: Emitter<ErrorEvent>;
    [ERROR_TYPES.BUSINESS_ERROR]: Emitter<ErrorEvent>;
    [ServerEventType.ALL_CARDS_REVEALED]: Emitter<AllCardsRevealedEvent>;
    [ServerEventType.BET_PLACED]: Emitter<BetPlacedEvent>;
    [ServerEventType.BOMB_DROPPED]: Emitter<BombDroppedEvent>;
    [ServerEventType.CARDS_PLAYED]: Emitter<CardsPlayedEvent>;
    [ServerEventType.CARDS_TRADED]: Emitter<CardsTradedEvent>;
    [ServerEventType.CARD_REQUESTED]: Emitter<CardRequestedEvent>;
    [ServerEventType.CLIENT_STATE_SYNC]: Emitter<ClientStateSyncEvent>;
    [ServerEventType.DRAGON_GIVEN]: Emitter<DragonGivenEvent>;
    [ServerEventType.GAME_ENDED]: Emitter<GameEndedEvent>;
    [ServerEventType.GAME_ROUND_ENDED]: Emitter<GameRoundEndedEvent>;
    [ServerEventType.GAME_ROUND_STARTED]: Emitter<GameRoundStartedEvent>;
    [ServerEventType.GAME_STARTED]: NoDataEmitter;
    [ServerEventType.MESSAGE_SENT]: Emitter<MessageSentEvent>;
    [ServerEventType.PENDING_DRAGON_DECISION]: NoDataEmitter;
    [ServerEventType.PLAYER_JOINED]: Emitter<PlayerJoinedEvent>;
    [ServerEventType.PLAYER_LEFT]: Emitter<PlayerLeftEvent>;
    [ServerEventType.TABLE_ROUND_ENDED]: Emitter<TableRoundEndedEvent>;
    [ServerEventType.TABLE_ROUND_STARTED]: Emitter<TableRoundStartedEvent>;
    [ServerEventType.TURN_PASSED]: Emitter<TurnPassedEvent>;
    [ServerEventType.WAITING_4_JOIN]: Emitter<WaitingForJoinEvent>;
};

export type ServerEventParams<Ev extends keyof ServerEvents> =
    Parameters<ServerEvents[Ev]>;

export type ClientEventParams<Ev extends keyof ClientEvents> =
    Parameters<ClientEvents[Ev]>;

export const noValidator = <T>(arg: T) => arg;
