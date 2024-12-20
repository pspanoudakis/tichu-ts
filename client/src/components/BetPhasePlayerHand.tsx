import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Card } from "./Card";

import { preTradePlayerBoxClass } from "./styleUtils";
import styles from "../styles/Components.module.css";
import {
    AppContext,
    handleAllCardsRevealedEvent,
    handleCardsTradedEvent
} from "../AppContext";
import { UICardInfo } from "../game_logic/UICardInfo";
import { PlayerInfoHeader } from "./PlayerInfoHeader";
import {
    ServerEventType,
    zAllCardsRevealedEvent,
    zCardsTradedEvent
} from "@tichu-ts/shared/schemas/events/ServerEvents";
import {
    eventHandlerWrapper,
    registerEventListenersHelper
} from "../utils/eventUtils";
import { CardInfo } from "@tichu-ts/shared/game_logic/CardInfo";
import {
    ClientEventType,
    TradeCardsEvent
} from "@tichu-ts/shared/schemas/events/ClientEvents";
import {
    TradeDecisions,
    getEmptyTradeDesicions
} from "../game_logic/TradeDecisions";
import { PlaceBetButton } from "./PlaceBetButton";
import { PlayerBet } from "@tichu-ts/shared/game_logic/PlayerBet";
import { GenericButton } from "./ui/GenericButton";

export const BetPhasePlayerHand: React.FC<{
    tradesInProgress: boolean,
}> = (props) => {

    const {state: ctxState, setState: setCtxState} = useContext(AppContext);

    const playerBet =
        ctxState.gameContext.currentRoundState?.thisPlayer.playerBet;

    const [cardsExpanded, setCardsExpanded] = useState(false);
    const [tradesSent, setTradesSent] = useState(false);
    const [incomingTradesSent, setIncomingTradesSent] = useState(false);
    const [tradesReceived, setTradesReceived] = useState(false);
    const [tradeDecisions, setTradeDecisions] =
        useState<TradeDecisions>(getEmptyTradeDesicions());

    useEffect(() => {
        if (props.tradesInProgress) {
            // switched from not in progress, so reset states
            setCardsExpanded(false);
            setTradesSent(false);
            setIncomingTradesSent(false);
            setTradesReceived(false);
            setTradeDecisions(getEmptyTradeDesicions());
        }
    }, [props.tradesInProgress]);

    useEffect(() => registerEventListenersHelper({
        [ServerEventType.ALL_CARDS_REVEALED]: eventHandlerWrapper(
            zAllCardsRevealedEvent.parse, e => {
                handleAllCardsRevealedEvent(e, setCtxState);
                setCardsExpanded(true);
            }
        ),
    }, ctxState.socket), [ctxState, setCtxState]);
    useEffect(() => registerEventListenersHelper({
        [ServerEventType.CARDS_TRADED]: eventHandlerWrapper(
            zCardsTradedEvent.parse, e => {
                setIncomingTradesSent(true);
                handleCardsTradedEvent(e, tradeDecisions, setCtxState);
                setTradeDecisions({
                    teammate: new UICardInfo(e.data.cardByTeammate),
                    leftOp: new UICardInfo(e.data.cardByLeft),
                    rightOp: new UICardInfo(e.data.cardByRight),
                });
            }
        ),
    }, ctxState.socket), [ctxState, setCtxState, tradeDecisions]);

    const allCards = useMemo(() => 
        ctxState.gameContext.currentRoundState?.thisPlayer.cardKeys
            .map(k => new UICardInfo(k)).sort(CardInfo.compareCards) ?? []
    ,[ctxState.gameContext.currentRoundState?.thisPlayer.cardKeys]);

    const nonSelectedCards = useMemo(() => {
        return allCards.filter(c => (
            c.key !== tradeDecisions.teammate?.key &&
            c.key !== tradeDecisions.leftOp?.key &&
            c.key !== tradeDecisions.rightOp?.key
        ));
    }, [
        tradeDecisions.teammate?.key,
        tradeDecisions.leftOp?.key,
        tradeDecisions.rightOp?.key,
        allCards,
    ]);

    const onCardsExpanded = useCallback(() => {
        ctxState.socket?.emit(ClientEventType.REVEAL_ALL_CARDS);
    }, [ctxState.socket]);

    const onTradesFinalized = useCallback(() => {
        if (
            tradeDecisions.teammate?.key &&
            tradeDecisions.leftOp?.key &&
            tradeDecisions.rightOp?.key
        ) {
            const e: TradeCardsEvent = {
                data: {
                    teammateCardKey: tradeDecisions.teammate.key,
                    leftCardKey: tradeDecisions.leftOp.key,
                    rightCardKey: tradeDecisions.rightOp.key,
                }
            };
            ctxState.socket?.emit(
                ClientEventType.TRADE_CARDS, e, () => setTradesSent(true)
            );
        } else {
            alert('Trade decisions are incomplete.');
        }
    }, [
        tradeDecisions.teammate?.key,
        tradeDecisions.leftOp?.key,
        tradeDecisions.rightOp?.key,
        ctxState.socket,
    ]);

    const onTradesReceived = useCallback(() => {
        ctxState.socket?.emit(
            ClientEventType.RECEIVE_TRADE, () => setTradesReceived(true)
        );
    }, [ctxState.socket]);

    const onCardClicked = useCallback((key: string) => {
        const card = allCards.find(c => c.key === key);
        switch (key) {
            case tradeDecisions.teammate?.key:
                return setTradeDecisions(td => ({ ...td, teammate: undefined }));
            case tradeDecisions.leftOp?.key:
                return setTradeDecisions(td => ({ ...td, leftOp: undefined }));
            case tradeDecisions.rightOp?.key:
                return setTradeDecisions(td => ({ ...td, rightOp: undefined }));
            default:
                if (!tradeDecisions.leftOp)
                    return setTradeDecisions(td => ({ ...td, leftOp: card }));
                if (!tradeDecisions.teammate)
                    return setTradeDecisions(td => ({ ...td, teammate: card }));
                if (!tradeDecisions.rightOp)
                    return setTradeDecisions(td => ({ ...td, rightOp: card }));
                break;
        }
    }, [
        allCards,
        tradeDecisions.teammate,
        tradeDecisions.leftOp,
        tradeDecisions.rightOp,
    ]);

    return (
        <div className={preTradePlayerBoxClass}>
            <PlayerInfoHeader
                nickname={ctxState.gameContext.thisPlayer?.nickname}
                numCards={allCards.length}
                bet={playerBet}
            />
            {
                props.tradesInProgress && (cardsExpanded ? (
                    <>
                        <div className={styles.preTradeCardList}>{
                            nonSelectedCards.map((card, i) => (
                                <Card
                                    key={card.key} id={card.key} index={i}
                                    cardImg={card.img} alt={card.imgAlt}
                                    onClick={onCardClicked}
                                    isSelected={true}
                                />
                            ))
                        }</div>
                        <div className={styles.tradingCardSlots}>{
                            [
                                tradeDecisions.leftOp,
                                tradeDecisions.teammate,
                                tradeDecisions.rightOp
                            ].map((td, i) => (
                                <div key={i} className={styles.tradingCardSlot}>
                                    <span>{}</span>
                                    {
                                        td !== undefined ?
                                        <Card
                                            key={td.key} id={td.key} index={i}
                                            alt={td.imgAlt} cardImg={td.img}
                                            isSelected={true}
                                            onClick={
                                                tradesSent ?
                                                undefined : onCardClicked
                                            }
                                            omitPosition
                                        /> : <span></span>
                                    }
                                </div>
                            ))
                        }</div>
                        <div className={styles.tradePhaseButtonContainer}>
                        {
                            tradesSent ? (
                                incomingTradesSent ? (
                                    <GenericButton
                                        w='35%'
                                        disabled={tradesReceived}
                                        onClick={onTradesReceived}
                                    >
                                    { tradesReceived ? 'Cards Received' : 'Receive Cards' }
                                    </GenericButton>
                                ) : (
                                    <GenericButton w='35%' disabled>
                                        Cards Sent
                                    </GenericButton>
                                )
                            ) : (
                                <GenericButton w='35%' onClick={onTradesFinalized}>
                                    Send
                                </GenericButton>
                            )
                        }
                        {
                            (playerBet === PlayerBet.NONE || !playerBet) && (
                                <PlaceBetButton
                                    bet={PlayerBet.TICHU}
                                    className={styles.tradePhaseButton}
                                />
                            )
                        }
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.preTradeCardList}>{
                            allCards.map((card, i) => (
                                <Card
                                    key={card.key} id={card.key} index={i}
                                    cardImg={card.img} alt={card.imgAlt}
                                    isSelected={true}
                                />
                            ))
                        }</div>
                        <div className={styles.tradingCardSlots}/>
                        <div className={styles.tradePhaseButtonContainer}>
                            <GenericButton w='35%' onClick={onCardsExpanded}>
                                Expand Cards
                            </GenericButton>
                            {
                                (playerBet === PlayerBet.NONE || !playerBet) && (
                                    <PlaceBetButton
                                        bet={PlayerBet.GRAND_TICHU}
                                        className={styles.tradePhaseButton}
                                    />
                                )
                            }
                        </div>
                    </>
                ))
            }
        </div>
    );
}
