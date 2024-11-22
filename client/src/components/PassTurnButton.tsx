import { useCallback, useContext } from "react";
import { AppContext } from "../AppContext";
import { ClientEventType } from "@tichu-ts/shared/schemas/events/ClientEvents";

export const PassTurnButton: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);

    const onTurnPassed = useCallback(() => {
        ctxState.socket?.emit(ClientEventType.PASS_TURN, {});
    }, [ctxState.socket]);

    const canPass = (
        (
            ctxState.gameContext.currentRoundState?.playerInTurnKey ===
            ctxState.gameContext.thisPlayer?.playerKey
        ) &&
        !ctxState.gameContext.currentRoundState?.tableState.pendingBomb &&
        !ctxState.gameContext.currentRoundState?.tableState.pendingDragonSelection
    );

    return (
        canPass ?
        <button onClick={onTurnPassed}>Pass Turn</button>
        : null
    );
}
