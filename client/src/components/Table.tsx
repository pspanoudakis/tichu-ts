import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    AppContext,
    handleBombDroppedEvent,
    handleCardRequestedEvent,
    handleCardsPlayedEvent, 
    handlePendingDragonDecisionEvent, 
    handleTurnPassedEvent} from "../AppContext";
import {
    eventHandlerWrapper,
    registerEventListenersHelper
} from "../utils/eventUtils";
import {
    ServerEventType,
    zBombDroppedEvent,
    zCardRequestedEvent,
    zCardsPlayedEvent,
    zDragonGivenEvent,
    zPendingDragonDecisionEvent,
    zTableRoundEndedEvent,
    zTurnPassedEvent
} from "@tichu-ts/shared/schemas/events/ServerEvents";
import styles from "../styles/Components.module.css";
import { Card } from "./Card";
import { UICardInfo } from "../game_logic/UICardInfo";
import { DragonSelectionContainer } from "./DragonSelectionContainer";
import { usePlayerAccessProperty } from "../hooks/usePlayerAccessProperty";
import { getCardConfigByKey } from "@tichu-ts/shared/game_logic/CardConfig";
import { ServerEventParams, ServerEvents } from "@tichu-ts/shared/schemas/events/SocketEvents";

type LastActionInfo<T extends keyof ServerEvents> = {
    type: T,
    event: ServerEventParams<T>[0]
};

function checkLastActionType<T extends keyof ServerEvents>
(type: T, l?: LastActionInfo<any>): l is LastActionInfo<T> {
    return l?.type === type;
}

export const Table: React.FC<{}> = () => {

    const { state: ctxState, setState: setCtxState } = useContext(AppContext);
    const gc = ctxState.gameContext;
    const [lastAction, setLastAction] = useState<
        LastActionInfo<typeof ServerEventType[keyof typeof ServerEventType]>
    >();

    useEffect(() => registerEventListenersHelper({
        [ServerEventType.CARDS_PLAYED]: eventHandlerWrapper(
            zCardsPlayedEvent.parse,
            e => {
                handleCardsPlayedEvent(e, setCtxState);
                setLastAction({
                    type: ServerEventType.CARDS_PLAYED,
                    event: e,
                });
            }
        ),
        [ServerEventType.TURN_PASSED]: eventHandlerWrapper(
            zTurnPassedEvent.parse,
            e => {
                handleTurnPassedEvent(e, setCtxState);
                setLastAction({
                    type: ServerEventType.TURN_PASSED,
                    event: e,
                });
            }
        ),
        [ServerEventType.CARD_REQUESTED]: eventHandlerWrapper(
            zCardRequestedEvent.parse,
            e => handleCardRequestedEvent(e, setCtxState)
        ),
        [ServerEventType.PENDING_DRAGON_DECISION]: eventHandlerWrapper(
            zPendingDragonDecisionEvent.parse,
            e => handlePendingDragonDecisionEvent(e, setCtxState)
        ),
        [ServerEventType.DRAGON_GIVEN]: eventHandlerWrapper(
            zDragonGivenEvent.parse, e => setLastAction({
                type: ServerEventType.DRAGON_GIVEN,
                event: e,
            })
        ),
        [ServerEventType.BOMB_DROPPED]: eventHandlerWrapper(
            zBombDroppedEvent.parse,
            e => handleBombDroppedEvent(e, setCtxState)
        ),
        [ServerEventType.TABLE_ROUND_ENDED]: eventHandlerWrapper(
            zTableRoundEndedEvent.parse, e => setLastAction({
                type: ServerEventType.TABLE_ROUND_ENDED,
                event: e,
            })
        )
    }, ctxState.socket), [ctxState.socket, setCtxState]);

    const currentRoundState = gc.currentRoundState;

    const lastActionPlayerProperty = usePlayerAccessProperty(lastAction?.event.playerKey);
    const dragonCollectorProperty = usePlayerAccessProperty(
        (checkLastActionType(ServerEventType.DRAGON_GIVEN, lastAction)) ?
        lastAction.event.data.dragonReceiverKey : undefined
    );
    const tableRoundWinnerProperty = usePlayerAccessProperty(
        (checkLastActionType(ServerEventType.TABLE_ROUND_ENDED, lastAction)) ?
        lastAction.event.data.roundWinner : undefined
    );
    const lastActionPlayerNickname = 
        lastActionPlayerProperty && gc[lastActionPlayerProperty]?.nickname;
    const dragonCollectorNickname =
        dragonCollectorProperty && gc[dragonCollectorProperty]?.nickname;
    const tableRoundWinnerNickname =
        tableRoundWinnerProperty && gc[tableRoundWinnerProperty]?.nickname;
    const lastActionDesc = useMemo(() => {
        if (checkLastActionType(ServerEventType.CARDS_PLAYED, lastAction)) {
            const cardNames = lastAction.event.data.tableCardKeys.map(
                k => getCardConfigByKey(k)?.name
            );
            return `${lastActionPlayerNickname} played: ${cardNames.join(' ')}`;
        }
        if (checkLastActionType(ServerEventType.TURN_PASSED, lastAction)) {
            return `${lastActionPlayerNickname} passed.`;
        }
        if (checkLastActionType(ServerEventType.TABLE_ROUND_ENDED, lastAction)) {
            return `${tableRoundWinnerNickname} collected the cards.`;
        }
        if (checkLastActionType(ServerEventType.DRAGON_GIVEN, lastAction)) {
            return `The cards were given to ${dragonCollectorNickname}.`;
        }
    }, [
        lastAction,
        lastActionPlayerNickname,
        dragonCollectorNickname,
        tableRoundWinnerNickname
    ]);

    const requestedCardName = currentRoundState?.requestedCardName;

    const tableCards = useMemo(() =>
        // Table cards are sent sorted
        currentRoundState?.tableState.currentCardKeys
            ?.map(k => new UICardInfo(k)) ?? []
    , [currentRoundState?.tableState.currentCardKeys]);

    const isPlayerCardsOwner = (
        gc.currentRoundState?.tableState.currentCardsOwner ===
        gc.thisPlayer?.playerKey
    );

    const cardsOwnerProperty =
        usePlayerAccessProperty(currentRoundState?.tableState.currentCardsOwner);

    const isDragonSelectionPending =
        currentRoundState?.tableState.pendingDragonSelection;

    return (
        <div className={styles.tableStyle}>
            <div className={styles.tableBox}>
                <div
                    style={{
                        paddingLeft: '2%',
                        paddingRight: '2%',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <span>{
                        requestedCardName ? `Requested: ${requestedCardName}` : ''
                    }</span>
                    <span>{
                        lastActionDesc || null
                    }</span>
                </div>
                {
                    (isPlayerCardsOwner && isDragonSelectionPending) ?
                    <DragonSelectionContainer/>
                    :
                    <div className={styles.tableCardList}>{
                        tableCards.map((card, i) =>
                            <Card
                                key={card.key} id={card.key} index={i}
                                cardImg={card.img} alt={card.imgAlt}
                            />
                        )
                    }</div>
                }
                <span>{
                    cardsOwnerProperty &&
                    `By: ${gc[cardsOwnerProperty]?.nickname}`
                }</span>
            </div>
        </div>
    );
};
