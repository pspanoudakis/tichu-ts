import { useCallback, useContext } from "react";
import { AppContext } from "../AppContext";
import { ClientEventType, DropBombEvent } from "@tichu-ts/shared/schemas/events/ClientEvents";

export const DropBombButton: React.FC<{
    hasPlayableBomb: boolean
}> = (props) => {

    const { state: ctxState } = useContext(AppContext);

    const onBombDropped = useCallback(() => {
        const e: DropBombEvent = {
            eventType: ClientEventType.DROP_BOMB,
        };
        ctxState.socket?.emit(ClientEventType.DROP_BOMB, e);
    }, [ctxState.socket]);

    const currentRoundState = ctxState.gameContext.currentRoundState;

    const canDropBomb =
        props.hasPlayableBomb &&
        !currentRoundState?.tableState.pendingBomb &&
        !currentRoundState?.tableState.pendingDragonSelection && (
            currentRoundState?.tableState.currentCombination || (
                currentRoundState?.playerInTurnKey ===
                ctxState.gameContext.thisPlayer?.playerKey
            )
        )

    return (
        canDropBomb ?
        <button onClick={onBombDropped}>Bomb</button>
        : null
    );
}
