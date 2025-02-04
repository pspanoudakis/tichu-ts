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
import { AppContext } from "../AppContext";
import { PlayerKey } from "@tichu-ts/shared/game_logic/PlayerKeys";
import { Button } from "@chakra-ui/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

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
                <Button
                    onClick={onDragonSelectionLeft}
                    w='2em' h='3em'
                >
                    <FaChevronLeft/>
                </Button>
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
                <Button
                    w='2em' h='3em'
                    onClick={onDragonSelectionRight}
                >
                    <FaChevronRight/>
                </Button>
                : ''
            }
        </div> : null
    )
}
