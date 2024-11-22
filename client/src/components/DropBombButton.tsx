import { useCallback, useContext } from "react";
import { AppContext } from "../AppContext";
import { ClientEventType } from "@tichu-ts/shared/schemas/events/ClientEvents";

export const DropBombButton: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);

    const onBombDropped = useCallback(() => {
        ctxState.socket?.emit(ClientEventType.DROP_BOMB, {});
    }, [ctxState.socket]);

    const canDropBomb =
        !ctxState.gameContext.currentRoundState?.tableState.pendingBomb &&
        !ctxState.gameContext.currentRoundState?.tableState.pendingDragonSelection;

    return (
        canDropBomb ?
        <button onClick={onBombDropped}>Bomb</button>
        : null
    );
}
