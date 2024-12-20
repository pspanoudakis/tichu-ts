import { z } from "zod";
import { createGameEventSchema } from "./GameEvent";
import { zCardKey, zNormalCardName } from "../../game_logic/CardConfig";
import { PlayerKey, zPlayerKey } from "../../game_logic/PlayerKeys";
import { CardCombinationType } from "../../game_logic/CardCombinations";
import { PlayerBet } from "../../game_logic/PlayerBet";
import { zRoundScore } from "../../game_logic/RoundScore";
import { zGameWinnerResult } from "../../game_logic/GameWinnerResult";

export const ServerEventType = {
    WAITING_4_JOIN: 'WAITING_4_JOIN',
    PLAYER_JOINED: 'PLAYER_JOINED',
    PLAYER_LEFT: 'PLAYER_LEFT',
    ALL_CARDS_REVEALED: 'ALL_CARDS_REVEALED',
    CARDS_PLAYED: 'CARDS_PLAYED',
    TURN_PASSED: 'TURN_PASSED',
    CARDS_TRADED: 'CARDS_TRADED',
    PENDING_DRAGON_DECISION: 'PENDING_DRAGON_DECISION',
    DRAGON_GIVEN: 'DRAGON_GIVEN',
    BET_PLACED: 'BET_PLACED',
    BOMB_DROPPED: 'BOMB_DROPPED',
    CARD_REQUESTED: 'CARD_REQUESTED',
    MESSAGE_SENT: 'MESSAGE_SENT',
    TABLE_ROUND_STARTED: 'TABLE_ROUND_STARTED',
    TABLE_ROUND_ENDED: 'TABLE_ROUND_ENDED',
    GAME_ROUND_STARTED: 'GAME_ROUND_STARTED',
    GAME_ROUND_ENDED: 'GAME_ROUND_ENDED',
    GAME_STARTED: 'GAME_STARTED',
    GAME_ENDED: 'GAME_ENDED',
    CLIENT_STATE_SYNC: 'CLIENT_STATE_SYNC',
} as const;

export const zWaitingForJoinEvent = createGameEventSchema(
    z.object({
        presentPlayers: z.object<{
            [playerKey in PlayerKey] : z.ZodOptional<z.ZodString>
        }>({
            player1: z.string().optional(),
            player2: z.string().optional(),
            player3: z.string().optional(),
            player4: z.string().optional(),
        }),
        winningScore: z.number(),
    }),
    zPlayerKey,
);
export type WaitingForJoinEvent = z.infer<typeof zWaitingForJoinEvent>;

export const zPlayerJoinedEvent = createGameEventSchema(
    z.object({
        playerNickname: z.string(),
    }),
    zPlayerKey,
)
export type PlayerJoinedEvent = z.infer<typeof zPlayerJoinedEvent>;

export const zPlayerLeftEvent = createGameEventSchema(
    z.object({
        gameOver: z.boolean(),
    }),
    zPlayerKey,
);
export type PlayerLeftEvent = z.infer<typeof zPlayerLeftEvent>;

export const zAllCardsRevealedEvent = createGameEventSchema(
    z.object({
        cards: z.array(zCardKey),
    })
);
export type AllCardsRevealedEvent = z.infer<typeof zAllCardsRevealedEvent>;

export const zCardsPlayedEvent = createGameEventSchema(
    z.object({
        numCardsRemainingInHand: z.number(),
        combinationType: z.nativeEnum(CardCombinationType),
        tableCardKeys: z.array(zCardKey),
        requestedCardName: z.optional(zNormalCardName),
        currentPlayer: zPlayerKey,
        phoenixAltName: z.optional(zNormalCardName),
    }),
    zPlayerKey,
);
export type CardsPlayedEvent = z.infer<typeof zCardsPlayedEvent>;

export const zTurnPassedEvent = createGameEventSchema(
    z.object({
        currentPlayer: zPlayerKey,
    }),
    zPlayerKey,
);
export type TurnPassedEvent = z.infer<typeof zTurnPassedEvent>;

export const zCardsTradedEvent = createGameEventSchema(
    z.object({
        cardByTeammate: zCardKey,
        cardByLeft: zCardKey,
        cardByRight: zCardKey,
    })
);
export type CardsTradedEvent = z.infer<typeof zCardsTradedEvent>;

export const zPendingDragonDecisionEvent = createGameEventSchema();
export type PendingDragonDecisionEvent =
    z.infer<typeof zPendingDragonDecisionEvent>;

export const zDragonGivenEvent = createGameEventSchema(
    z.object({
        dragonReceiverKey: zPlayerKey,
    })
);
export type DragonGivenEvent = z.infer<typeof zDragonGivenEvent>;

export const zBetPlacedEvent = createGameEventSchema(
    z.object({
        betPoints: z.union([
            z.literal(PlayerBet.TICHU),
            z.literal(PlayerBet.GRAND_TICHU)
        ]),
    }),
    zPlayerKey,
)
export type BetPlacedEvent = z.infer<typeof zBetPlacedEvent>;

export const zBombDroppedEvent = createGameEventSchema(
    z.undefined(),
    zPlayerKey,
);
export type BombDroppedEvent = z.infer<typeof zBombDroppedEvent>;

export const zCardRequestedEvent = createGameEventSchema(
    z.object({
        requestedCardName: zNormalCardName,
    }),
    zPlayerKey,
)
export type CardRequestedEvent = z.infer<typeof zCardRequestedEvent>;

export const zMessageSentEvent = createGameEventSchema(
    z.object({
        sentBy: z.string(),
        sentOn: z.string(),
        text: z.string(),
    }),
    zPlayerKey,
);
export type MessageSentEvent = z.infer<typeof zMessageSentEvent>;

export const zTableRoundStartedEvent = createGameEventSchema(
    z.object({
        currentPlayer: zPlayerKey,
    })
);
export type TableRoundStartedEvent = z.infer<typeof zTableRoundStartedEvent>;

export const zTableRoundEndedEvent = createGameEventSchema(
    z.object({
        roundWinner: zPlayerKey,
    })
);
export type TableRoundEndedEvent = z.infer<typeof zTableRoundEndedEvent>;

export const zGameRoundStartedEvent = createGameEventSchema(
    z.object({
        partialCards: z.array(zCardKey),
    })
);
export type GameRoundStartedEvent = z.infer<typeof zGameRoundStartedEvent>;

export const zGameRoundEndedEvent = createGameEventSchema(
    z.object({
        roundScore: zRoundScore,
    })
);
export type GameRoundEndedEvent = z.infer<typeof zGameRoundEndedEvent>;

export const zGameStartedEvent = createGameEventSchema(z.undefined());

export type GameStartedEvent = z.infer<typeof zGameStartedEvent>;

export const zGameEndedEvent = createGameEventSchema(
    z.object({
        result: zGameWinnerResult,
        team02TotalScore: z.number(),
        team13TotalScore: z.number(),
        scores: z.array(zRoundScore),
    })
);
export type GameEndedEvent = z.infer<typeof zGameEndedEvent>;

export const zErrorEvent = createGameEventSchema(
    z.object({
        message: z.string(),
    })
);
export type ErrorEvent = z.infer<typeof zErrorEvent>;

export const zClientStateSyncEvent = createGameEventSchema(
    z.object({

    })
);
export type ClientStateSyncEvent = z.infer<typeof zClientStateSyncEvent>;

export const zServerEvent = z.union([
    zWaitingForJoinEvent,
    zPlayerJoinedEvent,
    zPlayerLeftEvent,
    zAllCardsRevealedEvent,
    zCardsPlayedEvent,
    zTurnPassedEvent,
    zCardsTradedEvent,
    zPendingDragonDecisionEvent,
    zDragonGivenEvent,
    zBetPlacedEvent,
    zBombDroppedEvent,
    zCardRequestedEvent,
    zMessageSentEvent,
    zTableRoundStartedEvent,
    zTableRoundEndedEvent,
    zGameRoundStartedEvent,
    zGameRoundEndedEvent,
    zGameEndedEvent,
    zErrorEvent,
    zClientStateSyncEvent,

])
export type ServerEvent = z.infer<typeof zServerEvent>;
