import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Card } from './Card';
import { RequestedCardSelector } from './RequestedCardSelector';
import { PhoenixSelector } from './PhoenixSelector';

import { rightActionButtonsDiv } from "./styleUtils";
import { AppContext } from '../AppContext';

import styles from "../styles/Components.module.css"
import { UICardInfo } from '../game_logic/UICardInfo';
import {
    getNormalCardValueByName,
    NormalCardName,
    SpecialCards
} from '@tichu-ts/shared/game_logic/CardConfig';
import { PlaceBetButton } from './PlaceBetButton';
import { CardInfo } from '@tichu-ts/shared/game_logic/CardInfo';
import { PlayCardsButton } from './PlayCardsButton';
import { PassTurnButton } from './PassTurnButton';
import { DropBombButton } from './DropBombButton';
import { InGamePlayerBoxWrapper } from './InGamePlayerBoxWrapper';
import { PlayerBet } from '@tichu-ts/shared/game_logic/PlayerBet';
import { Bomb } from '@tichu-ts/shared';

export const ControlledPlayerHand: React.FC<{}> = () => {

    const { state: ctxState } = useContext(AppContext);
    const currentRoundState = ctxState.gameContext.currentRoundState;

    const [phoenixAltName, setPhoenixAltName] = useState<NormalCardName>();

    const cards = useMemo(() => {
        return currentRoundState
            ?.thisPlayer.cardKeys.map(k => new UICardInfo(k)) ?? [];
    }, [currentRoundState?.thisPlayer.cardKeys]);

    const sortedCards = useMemo(() => {
        const phoenixValue =
            (phoenixAltName && getNormalCardValueByName(phoenixAltName)) ?? 0;
        return cards.sort(
            (a, b) => CardInfo.compareCardsAlt(a, b, phoenixValue)
        );
    },[cards, phoenixAltName]);

    const [cardSelections, setCardSelections] = useState<{[s: string]: boolean}>(
        sortedCards.reduce((acc, c) => ({...acc, [c.key]: false}), {})
    );

    const hasSelectedCards = useMemo(
        () => Object.values(cardSelections).some(s => s),
        [cardSelections]
    );

    useEffect(() => {
        setCardSelections(
            cs => sortedCards.reduce((acc, c) => ({...acc, [c.key]: cs[c.key]}), {})
        );
    }, [sortedCards]);    

    const onCardClicked = useCallback(
        (cardKey: string) => setCardSelections({
            ...cardSelections,
            [cardKey]: !cardSelections[cardKey]
        }),
        [cardSelections]
    );

    const canBetTichu =
        currentRoundState?.thisPlayer.cardKeys.length === 14 &&
        currentRoundState?.thisPlayer.playerBet === PlayerBet.NONE;

    const hasPlayableBomb = useMemo(() => {
        const bomb = Bomb.getStrongestBomb(cards);
        const tableCombination = currentRoundState?.tableState.currentCombination;
        return Boolean(
            bomb && (
                !(tableCombination instanceof Bomb) || (Number(
                    Bomb.getStrongestBomb(cards)?.compareCombination(tableCombination)
                ) > 0)
            )
        );
    }, [currentRoundState?.tableState.currentCombination, cards]);
    
    return (
        <div className={styles.thisPlayer}>
            <InGamePlayerBoxWrapper
                playerKey={ctxState.gameContext.thisPlayer?.playerKey}
            >
                <div className={styles.playerCardList}>{
                    sortedCards.map((c, i) => 
                        <Card
                            key={c.key} id={c.key} index={i}
                            cardImg={c.img} alt={c.imgAlt}
                            isSelected={cardSelections[c.key]}
                            anySelected={hasSelectedCards}
                            onClick={onCardClicked}
                        />
                    )
                }</div>
                <div className={styles.selectionsContainer}>
                {
                    cardSelections[SpecialCards.Mahjong] &&
                    <RequestedCardSelector/>
                }
                {
                    cardSelections[SpecialCards.Phoenix] &&
                    (Object.values(cardSelections).filter(cs => cs).length > 4) &&
                    <PhoenixSelector onAltNameChange={setPhoenixAltName}/>
                }
                </div>
            </InGamePlayerBoxWrapper>
            <div className={styles.actionButtonsMainContainer}>
                { canBetTichu && <PlaceBetButton bet={PlayerBet.TICHU}/> }
                <div className={rightActionButtonsDiv}>
                    <PlayCardsButton
                        cardSelections={cardSelections}
                        phoenixAltName={phoenixAltName}
                    />
                    <PassTurnButton/>
                    <DropBombButton hasPlayableBomb={hasPlayableBomb}/>
                </div>
            </div>
        </div>
    );
}
