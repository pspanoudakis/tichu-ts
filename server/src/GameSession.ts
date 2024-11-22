import { GameClient } from "./GameClient";
import {
    ClientEventType,
    PlaceBetEvent,
    RevealAllCardsEvent,
    TradeCardsEvent,
    ReceiveTradeEvent,
    PlayCardsEvent,
    PassTurnEvent,
    DropBombEvent,
    RequestCardEvent,
    GiveDragonEvent,
    SendMessageEvent,
    zDropBombEvent,
    zPlaceBetEvent,
    zRevealAllCardsEvent,
    zTradeCardsEvent,
    zReceiveTradeEvent,
    zPlayCardsEvent,
    zPassTurnEvent,
    zRequestCardEvent,
    zGiveDragonEvent,
    zSendMessageEvent,
    zJoinGameEvent,
    JoinGameEvent,
    zStartGameEvent,
    StartGameEvent
} from "@tichu-ts/shared/schemas/events/ClientEvents";
import { GameState } from "./game_logic/GameState";
import {
    ServerEventType,
} from "@tichu-ts/shared/schemas/events/ServerEvents";
import { GameEvent } from "@tichu-ts/shared/schemas/events/GameEvent";
import { ChatMessage } from "./game_logic/ChatMessage";
import { PLAYER_KEYS, PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";
import { BusinessError, extractErrorInfo } from "./utils/errors";
import { SocketIONamespace, SocketIOServer, SocketIOSocket } from "./utils/sockets";
import { ServerEventParams, ServerEvents } from "@tichu-ts/shared/schemas/events/SocketEvents";

export type EventBase = GameEvent<any>;

export class GameSession {
    readonly id: string;

    private sessionNamespace: SocketIONamespace;
    private clients: {
        [playerKey in PlayerKey]: GameClient | null;
    } = {
        player1: null,
        player2: null,
        player3: null,
        player4: null,
    };
    private gameState: GameState;

    private chatMessages = new Array<ChatMessage>();

    constructor(sessionId: string, socketServer: SocketIOServer, winningScore: number) {
        this.id = sessionId;
        this.sessionNamespace = socketServer.of(`/${sessionId}`);
        this.gameState = new GameState(
            winningScore,
            this.emitEventByKey.bind(this),
            this.sessionNamespace.emit.bind(this.sessionNamespace)
        );
        this.sessionNamespace.use((_, next) => {
            // Maybe add auth here?
            next();
        }).on('connection', (socket) => {
            if(socket.recovered) {
                // Emit data sync event to socket?
                return;
            };
            const playerKey = PLAYER_KEYS.find(key => this.clients[key] === null);
            if (!playerKey) {
                // Session full, reject connection
                socket.disconnect(true);
                return;
            }
            const client = new GameClient(playerKey);
            socket.data.playerKey = playerKey;
            this.clients[playerKey] = client;
            socket.on('disconnect', (reason) => {
                console.warn(`Player: '${playerKey}' disconnected: ${reason}`);
                try {
                    this.gameState.onPlayerLeft(playerKey, client.hasJoinedGame);
                    this.clients[playerKey] = null;
                } catch (error) {
                    console.error(
                        `Error during client disconnection: ${error?.toString()}`
                    );
                }
            }).on(ClientEventType.JOIN_GAME, (event: any) => {
                let e: JoinGameEvent;
                try {
                    e = zJoinGameEvent.parse(event);
                } catch (error) {
                    return GameSession.emitError(socket, error);
                }
                try {
                    client.joinGame();
                } catch (error) {
                    return GameSession.emitError(socket, error);
                }
                client.nickname = e.data.playerNickname;
                this.sessionNamespace.emit(ServerEventType.PLAYER_JOINED, {
                    playerKey: playerKey,
                    data: {
                        playerNickname: e.data.playerNickname,
                    }
                });
            }).on(ClientEventType.START_GAME, this.eventHandlerWrapper(
                client, zStartGameEvent.parse, (e: StartGameEvent) => {
                    if (this.gameState.isGameInProgress)
                        throw new BusinessError('The game has already started.');
                    client.hasPressedStart = true;
                    const clients = Object.values(this.clients);
                    if (clients.every(c => c?.hasPressedStart)) {
                        this.gameState.onGameStart();
                        for (const c of clients) {
                            if (c) c.hasPressedStart = false;
                        }
                    }
                }
            )).on(ClientEventType.PLACE_BET, this.eventHandlerWrapper(
                client, zPlaceBetEvent.parse, (e: PlaceBetEvent) => {
                    this.gameState.onBetPlaced(playerKey, e);
                }
            )).on(ClientEventType.REVEAL_ALL_CARDS, this.eventHandlerWrapper(
                client, zRevealAllCardsEvent.parse, (e: RevealAllCardsEvent) => {
                    this.gameState.onAllCardsRevealed(playerKey, e);
                }
            )).on(ClientEventType.TRADE_CARDS, this.eventHandlerWrapper(
                client, zTradeCardsEvent.parse, (e: TradeCardsEvent) => {
                    this.gameState.onCardsTraded(playerKey, e);
                }
            )).on(ClientEventType.RECEIVE_TRADE, this.eventHandlerWrapper(
                client, zReceiveTradeEvent.parse, (e: ReceiveTradeEvent) => {
                    this.gameState.onTradesReceived(playerKey, e);
                }
            )).on(ClientEventType.PLAY_CARDS, this.eventHandlerWrapper(
                client, zPlayCardsEvent.parse, (e: PlayCardsEvent) => {
                    this.gameState.onCardsPlayed(playerKey, e);
                }
            )).on(ClientEventType.PASS_TURN, this.eventHandlerWrapper(
                client, zPassTurnEvent.parse, (e: PassTurnEvent) => {
                    this.gameState.onTurnPassed(playerKey, e);
                }
            )).on(ClientEventType.DROP_BOMB, this.eventHandlerWrapper(
                client, zDropBombEvent.parse, (e: DropBombEvent) => {
                    this.gameState.onBombDropped(playerKey, e);
                }
            )).on(ClientEventType.REQUEST_CARD, this.eventHandlerWrapper(
                client, zRequestCardEvent.parse, (e: RequestCardEvent) => {
                    this.gameState.onCardRequested(playerKey, e);
                }
            )).on(ClientEventType.GIVE_DRAGON, this.eventHandlerWrapper(
                client, zGiveDragonEvent.parse, (e: GiveDragonEvent) => {
                    this.gameState.onDragonGiven(playerKey, e);
                }
            )).on(ClientEventType.SEND_MESSAGE, this.eventHandlerWrapper(
                client, zSendMessageEvent.parse, (e: SendMessageEvent) => {
                    const msg = new ChatMessage(client.nickname, e.data.text);
                    this.chatMessages.push(msg);
                    this.sessionNamespace.emit(ServerEventType.MESSAGE_SENT, {
                        playerKey,
                        data: msg.toJSON(),
                    });
                }
            ));
            socket.emit(ServerEventType.WAITING_4_JOIN, {
                playerKey: playerKey,
                data: {
                    winningScore: this.gameState.winningScore,
                    presentPlayers: PLAYER_KEYS.reduce<
                        {[playerKey in PlayerKey]?: string}
                    >((acc, k) => {
                        acc[k] = this.clients[k]?.nickname;
                        return acc;
                    }, {})
                },
            });
        });
    }

    private static emitError(socket: SocketIOSocket, error: any) {
        const { errorType: eventType, message } = extractErrorInfo(error);
        socket.emit(eventType, {
            data: {
                message,
            },
        });        
    }

    private emitErrorByKey(playerKey: PlayerKey, error: any) {
        const socket = this.getSocketByPlayerKey(playerKey);
        if (!socket) return;
        GameSession.emitError(socket, error);
    }

    private eventHandlerWrapper<T>(
        client: GameClient,
        validator: (e: any) => T,
        eventHandler: (e: T) => void,
    ) {
        return (event?: any, ackFn?: () => void) => {
            try {
                if (!client.hasJoinedGame)
                    throw new BusinessError(`Client has not joined the game yet.'`);
                eventHandler(validator(event));
                ackFn?.();
            } catch (error) {
                this.emitErrorByKey(client.playerKey, error);
            }
        };
    }

    private getSocketByPlayerKey(key: PlayerKey) {
        for (const s of this.sessionNamespace.sockets.values()) {
            if (s.data.playerKey === key)
                return s;
        }
    }

    private emitEventByKey<T extends keyof ServerEvents>(
        playerKey: PlayerKey,
        eventType: T,
        ...args: ServerEventParams<T>
    ) {
        this.getSocketByPlayerKey(playerKey)?.emit(eventType, ...args);
    }

    isFull() {
        return PLAYER_KEYS.every(key => this.clients[key] !== null);
    }
}
