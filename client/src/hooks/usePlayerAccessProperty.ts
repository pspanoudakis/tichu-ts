import { useContext, useMemo } from "react";
import { AppContext } from "../AppContext";
import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";

export const usePlayerAccessProperty = (playerKey?: PlayerKey) => {

    const { state: ctxState } = useContext(AppContext);

    return useMemo(() => {
        switch (playerKey) {
            case ctxState.gameContext.thisPlayer?.playerKey:
                return 'thisPlayer';
            case ctxState.gameContext.teammate?.playerKey:
                return 'teammate';
            case ctxState.gameContext.rightOpponent?.playerKey:
                return 'rightOpponent';
            case ctxState.gameContext.leftOpponent?.playerKey:
                return 'leftOpponent';
            default:
                console.warn(`Cannot find player with key: '${playerKey}'`);
                return undefined;
        }
    }, [
        playerKey,
        ctxState.gameContext.thisPlayer?.playerKey,
        ctxState.gameContext.teammate?.playerKey,
        ctxState.gameContext.leftOpponent?.playerKey,
        ctxState.gameContext.rightOpponent?.playerKey,
    ]);
};
