import React, { useContext, useMemo } from 'react';
import { AppContext } from '../AppContext';
import { InGamePlayerBoxWrapper } from './InGamePlayerBoxWrapper';
import { usePlayerAccessProperty } from '../hooks/usePlayerAccessProperty';

import styles from "../styles/Components.module.css"
import { PlayerKey } from '@tichu-ts/shared/game_logic/PlayerKeys';
import { HiddenCard } from './HiddenCard';

export const HiddenPlayerHand: React.FC<{
    playerKey?: PlayerKey,
    style: string,
}> = props => {

    const { state: ctxState } = useContext(AppContext);

    const playerProperty = usePlayerAccessProperty(props.playerKey);
    const numCards = (
        playerProperty &&
        ctxState.gameContext.currentRoundState?.[playerProperty].numberOfCards
    ) ?? 0;

    const cardsList = useMemo(
        () => Array.from({ length: numCards }).map(
            (_, i) => <HiddenCard index={i}/>
        ),
        [numCards]
    );

    return (
        <div className={props.style}>
            <InGamePlayerBoxWrapper
                playerKey={props.playerKey}
            >
                <div className={styles.playerCardList}>
                    { cardsList }
                </div>
            </InGamePlayerBoxWrapper>
        </div>
    )
};
