import React, { useContext, useMemo, useCallback } from "react";
import styles from "../styles/Components.module.css";
import {
    getCardConfigByKey,
    SpecialCards
} from "@tichu-ts/shared/game_logic/CardConfig";
import { Card } from "./Card";
import {
    ClientEventType,
    GiveDragonEvent
} from "@tichu-ts/shared/schemas/events/ClientEvents";
import { dragonSelection1, dragonSelection2 } from "./styleUtils";
import { AppContext } from "../AppContext";
import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";

export const DragonSelectionContainer: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);

    const currentRoundState = ctxState.gameContext.currentRoundState;

    const isDragonSelectionPending =
        currentRoundState?.tableState.pendingDragonSelection;

    const isLeftOpponentActive = useMemo(() =>
        (currentRoundState?.leftOpponent.numberOfCards ?? 0) > 0
    , [currentRoundState?.leftOpponent.numberOfCards]);
    
    const isRightOpponentActive = useMemo(() =>
        (currentRoundState?.rightOpponent.numberOfCards ?? 0) > 0
    , [currentRoundState?.rightOpponent.numberOfCards]);

    const onDragonSelection = useCallback((to: PlayerKey) => {
        const e: GiveDragonEvent = {
            data: {
                chosenOponentKey: to,
            }
        };
        ctxState.socket?.emit(ClientEventType.GIVE_DRAGON, e);
    }, [ctxState.socket]);

    const onDragonSelectionLeft = useCallback(() => {
        if (ctxState.gameContext.leftOpponent?.playerKey)
            onDragonSelection(ctxState.gameContext.leftOpponent.playerKey);
    }, [onDragonSelection, ctxState.gameContext.leftOpponent?.playerKey]);
    
    const onDragonSelectionRight = useCallback(() => {
        if (ctxState.gameContext.rightOpponent?.playerKey)
            onDragonSelection(ctxState.gameContext.rightOpponent.playerKey);
    }, [onDragonSelection, ctxState.gameContext.rightOpponent?.playerKey]);

    return (
        isDragonSelectionPending ?
        <div className={styles.dragonSelectionTableContainer}>
            {
                isLeftOpponentActive ?
                <button
                    key='<-' id='<-'
                    onClick={onDragonSelectionLeft}
                    className={dragonSelection1}
                >
                    {'<-'}
                </button>
                : ''
            }
            <Card
                key={SpecialCards.Dragon}
                id={SpecialCards.Dragon} index={0}
                cardImg={getCardConfigByKey(SpecialCards.Dragon)?.img ?? ''}
                alt={SpecialCards.Dragon}
                omitPosition
            />
            {
                isRightOpponentActive ?
                <button
                    key='->' id='->'
                    onClick={onDragonSelectionRight}
                    className={dragonSelection2}
                >
                    {'->'}
                </button>
                : ''
            }
        </div> : null
    )
}
