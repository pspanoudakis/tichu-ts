import { useCallback, useContext } from "react";
import { AppContext } from "../AppContext";
import { NormalCardName } from "@tichu-ts/shared/game_logic/CardConfig";
import {
    ClientEventType,
    PlayCardsEvent
} from "@tichu-ts/shared/schemas/events/ClientEvents";
import { GenericButton } from "./ui/GenericButton";

export const PlayCardsButton: React.FC<{
    cardSelections: {
        [s: string]: boolean;
    },
    phoenixAltName?: NormalCardName,
}> = ({ cardSelections, phoenixAltName }) => {

    const { state: ctxState } = useContext(AppContext);

    const onCardsPlayed = useCallback(() => {
        const e: PlayCardsEvent = {
            data: {
                selectedCardKeys:
                    Object.keys(cardSelections).filter(k => cardSelections[k]),
                phoenixAltName,
            }
        };
        ctxState.socket?.emit(ClientEventType.PLAY_CARDS, e);
    }, [ctxState.socket, cardSelections, phoenixAltName]);

    const canPlayCards =
        (
            ctxState.gameContext.currentRoundState?.playerInTurnKey ===
            ctxState.gameContext.thisPlayer?.playerKey
        ) &&
        !ctxState.gameContext.currentRoundState?.tableState.pendingDragonSelection

    return (
        canPlayCards ?
        <GenericButton onClick={onCardsPlayed}>Play Cards</GenericButton>
        : null
    );
}
