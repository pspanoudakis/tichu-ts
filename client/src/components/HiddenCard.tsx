import React from 'react';
import { cardImages } from '../assets/CardResources';

export const HiddenCard: React.FC<{
    index: number
}> = ({ index }) => {

    return (
        <img
            src={cardImages.get('cardBackground')}
            alt={'hidden'}
            style={{
                userSelect: "none",
                filter: 'drop-shadow(0.5vw 0.25vh 0.5vw rgba(0, 0, 0, 0.65))',
                position: 'absolute',
                left: (index * 2.5).toString() + '%',
                bottom: '15%',
                height: '50%',
                border: '1px solid white',
                borderRadius: '8%',
            }}
        />
    );
}
