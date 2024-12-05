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

    const canDropBomb =
        props.hasPlayableBomb &&
        !ctxState.gameContext.currentRoundState?.tableState.pendingBomb &&
        !ctxState.gameContext.currentRoundState?.tableState.pendingDragonSelection;

    return (
        canDropBomb ?
        <button onClick={onBombDropped}>Bomb</button>
        : null
    );
}
