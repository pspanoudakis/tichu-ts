import { z } from "zod";
import { createGameEventSchema } from "./GameEvent";
import { zCardKey, zCardName, zNormalCardName } from "../../game_logic/CardConfig";
import { zPlayerKey } from "../../game_logic/PlayerKeys";
import { PlayerBet } from "../../game_logic/PlayerBet";

export const ClientEventType =  {
    JOIN_GAME: 'JOIN_GAME',
    START_GAME: 'START_GAME',
    PLAY_CARDS: 'PLAY_CARDS',
    PASS_TURN: 'PASS_TURN',
    TRADE_CARDS: 'TRADE_CARDS',
    RECEIVE_TRADE: 'RECEIVE_TRADE',
    GIVE_DRAGON: 'GIVE_DRAGON',
    REVEAL_ALL_CARDS: 'REVEAL_ALL_CARDS',
    PLACE_BET: 'PLACE_BET',
    DROP_BOMB: 'DROP_BOMB',
    REQUEST_CARD: 'REQUEST_CARD',
    SEND_MESSAGE: 'SEND_MESSAGE',
} as const;

export const zJoinGameEvent = createGameEventSchema(
    z.object({
        playerNickname: z.string(),
    }),
)
export type JoinGameEvent = z.infer<typeof zJoinGameEvent>;

export const zPlayCardsEvent = createGameEventSchema(
    z.object({
        selectedCardKeys: z.array(zCardKey),
        phoenixAltName: zCardName.optional()
    })
)
export type PlayCardsEvent = z.infer<typeof zPlayCardsEvent>;

export const zTradeCardsEvent = createGameEventSchema(
    z.object({
        teammateCardKey: zCardKey,
        leftCardKey: zCardKey,
        rightCardKey: zCardKey,
    })
);
export type TradeCardsEvent = z.infer<typeof zTradeCardsEvent>;

export const zGiveDragonEvent = createGameEventSchema(
    z.object({
        chosenOponentKey: zPlayerKey,
    })
);
export type GiveDragonEvent = z.infer<typeof zGiveDragonEvent>

export const zPlaceBetEvent = createGameEventSchema(
    z.object({
        betPoints: z.union([
            z.literal(PlayerBet.TICHU),
            z.literal(PlayerBet.GRAND_TICHU)
        ]),
    })
)
export type PlaceBetEvent = z.infer<typeof zPlaceBetEvent>;

export const zRequestCardEvent = createGameEventSchema(
    z.object({
        requestedCardName: zNormalCardName,
    })
)
export type RequestCardEvent = z.infer<typeof zRequestCardEvent>;

export const zSendMessageEvent = createGameEventSchema(
    z.object({
        text: z.string().trim().min(1),
    })
);
export type SendMessageEvent = z.infer<typeof zSendMessageEvent>;
