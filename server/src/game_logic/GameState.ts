import {
    GiveDragonEvent,
    PlaceBetEvent,
    PlayCardsEvent,
    RequestCardEvent,
    TradeCardsEvent
} from "@tichu-ts/shared/schemas/events/ClientEvents";
import { ServerEventType } from "@tichu-ts/shared/schemas/events/ServerEvents";
import { UnexpectedCombinationType } from "@tichu-ts/shared/game_logic/CardCombinations";
import { CardInfo } from "@tichu-ts/shared/game_logic/CardInfo";
import { GameRoundState } from "./GameRoundState";
import {
    PLAYER_KEYS,
    PlayerKey,
    TEAM_KEYS,
    TEAM_PLAYERS,
} from "@tichu-ts/shared/game_logic/PlayerKeys";
import { GameWinnerResult } from "@tichu-ts/shared/game_logic/GameWinnerResult";
import { RoundScore } from "@tichu-ts/shared/game_logic/RoundScore";
import { BusinessError } from "../utils/errors";
import { ServerEventParams, ServerEvents } from "@tichu-ts/shared/schemas/events/SocketEvents";

enum GameStatus {
    INIT = 'INIT',
    IN_PROGRESS = 'IN_PROGRESS',
    OVER = 'OVER'
}

type PlayerEventEmitter = <T extends keyof ServerEvents>(
    playerKey: PlayerKey,
    eventType: T,
    ...args: ServerEventParams<T>
) => void;
type GlobalEventEmitter = <T extends keyof ServerEvents>(
    eventType: T,
    ...args: ServerEventParams<T>
) => void;

export class GameState {
    private _result?: GameWinnerResult;
    private scoreHistory = Array<RoundScore>();
    private team02TotalPoints = 0;
    private team13TotalPoints = 0;
    readonly winningScore: number;
    private status: GameStatus = GameStatus.INIT;
    private _currentRound?: GameRoundState;
    private emitToPlayer: PlayerEventEmitter;
    private emitToAll: GlobalEventEmitter;

    constructor(
        winningScore: number = 1,
        playerEventEmitter: PlayerEventEmitter,
        globalEventEmitter: GlobalEventEmitter
    ) {
        this.winningScore = winningScore;
        this.emitToPlayer = playerEventEmitter;
        this.emitToAll = globalEventEmitter;
    }

    get result() {
        if (!this._result)
            throw new BusinessError('Game Result not decided yet.');
        return this._result;
    }

    private get currentRound() {
        if (!this._currentRound)
            throw new BusinessError('Current Game round not initialized.');
        return this._currentRound;
    }

    get isGameOver() {
        return this.status === GameStatus.OVER;
    }

    get isGameInProgress() {
        return this.status === GameStatus.IN_PROGRESS;
    }

    private getPlayer(playerKey: PlayerKey) {
        return this.currentRound.players[playerKey];
    }

    private static mapCardsToKeys(cards: CardInfo[]) {
        return cards.map(c => c.key);
    }

    /**
     * Returns `true` if the game must end because the winning score
     * has been reached, `false` otherwise.
     */
    private mustEndGame() {
        return (
            (
                this.winningScore === 0 &&
                this.currentRound.mustEndGameRound()
            ) ||
            (this.team02TotalPoints >= this.winningScore) ||
            (this.team13TotalPoints >= this.winningScore)
        );
    }

    private endGameRound() {
        const score = this.currentRound.endGameRoundOrElseThrow();
        this.scoreHistory.push(score);
        this.team02TotalPoints += score.team02;
        this.team13TotalPoints += score.team13;
        if(this.mustEndGame()) {
            if (score.team02 > score.team13) {
                this._result = TEAM_KEYS.TEAM_02;
            } else if (score.team02 < score.team13) {
                this._result = TEAM_KEYS.TEAM_13;
            } else {
                this._result = 'TIE';
            }
            this.status = GameStatus.OVER;
        }
        return score;
    }

    private onGameRoundStarted() {
        this._currentRound = new GameRoundState();
        for (const key of PLAYER_KEYS) {
            const player = this.currentRound.players[key];
            this.emitToPlayer(key, ServerEventType.GAME_ROUND_STARTED, {
                data: {
                    partialCards:
                        GameState.mapCardsToKeys(player.getRevealedCards())
                },
            });
        }
    }

    private onTableRoundStarted() {
        this.emitToAll(ServerEventType.TABLE_ROUND_STARTED, {
            data: {
                currentPlayer: this.currentRound.currentPlayerKey,
            }
        })
    }

    private onGamePossiblyOver() {
        if (this.isGameOver) {
            this.emitToAll(ServerEventType.GAME_ENDED, {
                data: {
                    result: this.result,
                    team02TotalScore: this.team02TotalPoints,
                    team13TotalScore: this.team13TotalPoints,
                    scores: this.scoreHistory,
                }
            });
            this.status = GameStatus.INIT;
        } else {
            this.onGameRoundStarted();
        }
    }

    onGameStart() {
        if (this.status === GameStatus.IN_PROGRESS)
            throw new BusinessError('Game already started.');
        this.status = GameStatus.IN_PROGRESS;
        for (const key of PLAYER_KEYS) {
            this.emitToPlayer(key, ServerEventType.GAME_STARTED);                
        }
        this.onGameRoundStarted();
    }    

    onPlayerLeft(playerKey: PlayerKey, notifyOthers = false) {
        let skipGameOverEvent = true;
        switch (this.status) {
            case GameStatus.OVER:
            case GameStatus.INIT:
                break;
            case GameStatus.IN_PROGRESS:
                if (TEAM_PLAYERS['TEAM_02'].includes(playerKey)) {
                    this._result = "TEAM_13";
                } else if (TEAM_PLAYERS['TEAM_13'].includes(playerKey)) {
                    this._result = "TEAM_02";
                } else {
                    throw new Error(
                        `Unexpected player key on disconnected player: ${playerKey}`
                    );
                }
                this.status = GameStatus.OVER;
                skipGameOverEvent = false;
                break;        
            default:
                throw new Error(
                    `Unexpected game status during client disconnection: ${this.status}`
                );
        }
        if (notifyOthers) {
            this.emitToAll(ServerEventType.PLAYER_LEFT, {
                playerKey: playerKey,
                data: {
                    gameOver: this.isGameOver,
                }
            });
            if (!skipGameOverEvent) this.onGamePossiblyOver();
        }
    }

    onCardsPlayed(playerKey: PlayerKey, e: PlayCardsEvent) {
        const player = this.getPlayer(playerKey);
        const cards = this.currentRound.playCardsOrElseThrow(player, e);
        const combType = 
            this.currentRound.currentTableCombination?.type;
        if (!combType) throw new UnexpectedCombinationType (
            'Unexpected Error: Table combination is null'
        );
        this.emitToAll(ServerEventType.CARDS_PLAYED, {
            playerKey: playerKey,
            data: {
                combinationType: combType,
                numCardsRemainingInHand: player.getNumCards(),
                tableCardKeys: cards.map(c => c.key),
                requestedCardName: 
                    this.currentRound.requestedCardName,
                currentPlayer: this.currentRound.currentPlayerKey,
                phoenixAltName: e.data.phoenixAltName
            }
        });
        if (this.currentRound.mustEndGameRound()) {
            const score = this.endGameRound();
            this.emitToAll(ServerEventType.GAME_ROUND_ENDED, {
                data: {
                    roundScore: score,
                }
            });
            this.onGamePossiblyOver();
        }
    }

    onTurnPassed(playerKey: PlayerKey) {
        const cardsOwnerIdx =
            this.currentRound.currentTableCardsOwnerIdx;
        this.currentRound
            .passTurnOrElseThrow(this.getPlayer(playerKey));
        this.emitToAll(ServerEventType.TURN_PASSED, {
            playerKey: playerKey,
            data: {
                currentPlayer: this.currentRound.currentPlayerKey,
            }
        });
        if (this.currentRound.pendingDragonToBeGiven) {
            this.emitToAll(ServerEventType.PENDING_DRAGON_DECISION);
        } else if (!this.currentRound.currentTableCombination) {
            this.emitToAll(ServerEventType.TABLE_ROUND_ENDED, {
                data: {
                    roundWinner: PLAYER_KEYS[cardsOwnerIdx]
                }
            });
            this.onTableRoundStarted();
        }
    }

    onBetPlaced(playerKey: PlayerKey, e: PlaceBetEvent) {
        this.getPlayer(playerKey).placeBetOrElseThrow(e);
        this.emitToAll(ServerEventType.BET_PLACED, {
            playerKey: playerKey,
            data: {
                betPoints: e.data.betPoints
            }
        });
    }

    onAllCardsRevealed(playerKey: PlayerKey) {
        this.getPlayer(playerKey).revealCardsOrElseThrow();
        this.emitToPlayer(playerKey, ServerEventType.ALL_CARDS_REVEALED, {
            data: {
                cards: GameState.mapCardsToKeys(
                    this.getPlayer(playerKey).getRevealedCards()
                ),
            }
        });
    }

    onCardsTraded(playerKey: PlayerKey, e: TradeCardsEvent) {
        this.getPlayer(playerKey).finalizeTradesOrElseThrow(e);
        if (PLAYER_KEYS.every(
            k => this.currentRound.players[k].hasSentTrades
        )) {
            this.currentRound.makeCardTrades();
            for (const key of PLAYER_KEYS) {
                const player = this.currentRound.players[key];
                this.emitToPlayer(key, ServerEventType.CARDS_TRADED, {
                    data: {
                        cardByTeammate: player.incomingTrades.teammate.key,
                        cardByLeft: player.incomingTrades.left.key,
                        cardByRight: player.incomingTrades.right.key,
                    },
                })
            }
        }
    }

    onTradesReceived(playerKey: PlayerKey) {
        this.currentRound.onPlayerTradesReceived(playerKey);
        if (PLAYER_KEYS.every(
            k => this.currentRound.players[k].hasReceivedTrades
        )) {
            this.onTableRoundStarted();
        }
    }

    onBombDropped(playerKey: PlayerKey) {
        this.currentRound.enablePendingBombOrElseThrow(this.getPlayer(playerKey));
        this.emitToAll(ServerEventType.BOMB_DROPPED, {
            playerKey: playerKey,
        });
    }
    
    onCardRequested(playerKey: PlayerKey, e: RequestCardEvent) {
        this.currentRound.setRequestedCardOrElseThrow(this.getPlayer(playerKey), e);
        this.emitToAll(ServerEventType.CARD_REQUESTED, {
            playerKey: playerKey,
            data: {
                requestedCardName: e.data.requestedCardName
            },
        });
    }
    
    onDragonGiven(playerKey: PlayerKey, e: GiveDragonEvent) {
        this.currentRound.giveDragonOrElseThrow(this.getPlayer(playerKey), e);
        this.emitToAll(ServerEventType.DRAGON_GIVEN, {
            data: {
                dragonReceiverKey: e.data.chosenOponentKey
            },
        });
        this.onTableRoundStarted();
    }
}
