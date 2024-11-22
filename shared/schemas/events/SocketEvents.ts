import { ERROR_TYPES } from "../API";
import {
    ClientEventType,
    DropBombEvent,
    GiveDragonEvent,
    JoinGameEvent,
    PassTurnEvent,
    PlaceBetEvent,
    PlayCardsEvent,
    ReceiveTradeEvent,
    RequestCardEvent,
    RevealAllCardsEvent,
    SendMessageEvent,
    StartGameEvent,
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
    GameStartedEvent,
    MessageSentEvent,
    PendingDragonDecisionEvent,
    PlayerJoinedEvent,
    PlayerLeftEvent,
    ServerEventType,
    TableRoundEndedEvent,
    TableRoundStartedEvent,
    TurnPassedEvent,
    WaitingForJoinEvent
} from "./ServerEvents";

type NoDataEmitter = () => void;
type SimpleEmitter<T> = (eventData: T) => void;
type EmitterWithAck<T> = (eventData: T, ackFn: () => void) => void;

export type ClientEvents = {
    [ClientEventType.DROP_BOMB]: SimpleEmitter<DropBombEvent>,
    [ClientEventType.GIVE_DRAGON]: SimpleEmitter<GiveDragonEvent>,
    [ClientEventType.JOIN_GAME]: SimpleEmitter<JoinGameEvent>,
    [ClientEventType.PASS_TURN]: SimpleEmitter<PassTurnEvent>,
    [ClientEventType.PLACE_BET]: SimpleEmitter<PlaceBetEvent>,
    [ClientEventType.PLAY_CARDS]: SimpleEmitter<PlayCardsEvent>,
    [ClientEventType.RECEIVE_TRADE]: EmitterWithAck<ReceiveTradeEvent>,
    [ClientEventType.REQUEST_CARD]: SimpleEmitter<RequestCardEvent>,
    [ClientEventType.REVEAL_ALL_CARDS]: SimpleEmitter<RevealAllCardsEvent>,
    [ClientEventType.SEND_MESSAGE]: SimpleEmitter<SendMessageEvent>,
    [ClientEventType.START_GAME]: EmitterWithAck<StartGameEvent>,
    [ClientEventType.TRADE_CARDS]: EmitterWithAck<TradeCardsEvent>,
};

export type ServerEvents = {
    [ERROR_TYPES.INTERNAL_ERROR]: SimpleEmitter<ErrorEvent>;
    [ERROR_TYPES.VALIDATION_ERROR]: SimpleEmitter<ErrorEvent>;
    [ERROR_TYPES.BUSINESS_ERROR]: SimpleEmitter<ErrorEvent>;
    [ServerEventType.ALL_CARDS_REVEALED]: SimpleEmitter<AllCardsRevealedEvent>;
    [ServerEventType.BET_PLACED]: SimpleEmitter<BetPlacedEvent>;
    [ServerEventType.BOMB_DROPPED]: SimpleEmitter<BombDroppedEvent>;
    [ServerEventType.CARDS_PLAYED]: SimpleEmitter<CardsPlayedEvent>;
    [ServerEventType.CARDS_TRADED]: SimpleEmitter<CardsTradedEvent>;
    [ServerEventType.CARD_REQUESTED]: SimpleEmitter<CardRequestedEvent>;
    [ServerEventType.CLIENT_STATE_SYNC]: SimpleEmitter<ClientStateSyncEvent>;
    [ServerEventType.DRAGON_GIVEN]: SimpleEmitter<DragonGivenEvent>;
    [ServerEventType.GAME_ENDED]: SimpleEmitter<GameEndedEvent>;
    [ServerEventType.GAME_ROUND_ENDED]: SimpleEmitter<GameRoundEndedEvent>;
    [ServerEventType.GAME_ROUND_STARTED]: SimpleEmitter<GameRoundStartedEvent>;
    [ServerEventType.GAME_STARTED]: SimpleEmitter<GameStartedEvent>;
    [ServerEventType.MESSAGE_SENT]: SimpleEmitter<MessageSentEvent>;
    [ServerEventType.PENDING_DRAGON_DECISION]: SimpleEmitter<PendingDragonDecisionEvent>;
    [ServerEventType.PLAYER_JOINED]: SimpleEmitter<PlayerJoinedEvent>;
    [ServerEventType.PLAYER_LEFT]: SimpleEmitter<PlayerLeftEvent>;
    [ServerEventType.TABLE_ROUND_ENDED]: SimpleEmitter<TableRoundEndedEvent>;
    [ServerEventType.TABLE_ROUND_STARTED]: SimpleEmitter<TableRoundStartedEvent>;
    [ServerEventType.TURN_PASSED]: SimpleEmitter<TurnPassedEvent>;
    [ServerEventType.WAITING_4_JOIN]: SimpleEmitter<WaitingForJoinEvent>;
};

export type ServerEventParams<Ev extends keyof ServerEvents> =
    Parameters<ServerEvents[Ev]>;
