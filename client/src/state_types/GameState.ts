import { RoundScore } from "@tichu-ts/shared";
import { GameRoundState } from "./GameRoundState";
import { PlayerInfoState } from "./PlayerState";

export type GameState = {
    thisPlayer?: PlayerInfoState,
    teammate?: PlayerInfoState,
    leftOpponent?: PlayerInfoState,
    rightOpponent?: PlayerInfoState,
    currentRoundState?: GameRoundState,
    previousGames: RoundScore[],
    winningScore: number,
    gameOver: boolean,
};

export const createInitialGameState = (): GameState => ({
    previousGames: [],
    winningScore: -1,
    gameOver: false,
});
