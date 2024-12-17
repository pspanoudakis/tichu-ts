import React, { useCallback, useEffect } from 'react';

import styles from "../styles/Components.module.css"
import {
    NormalCardName,
    reversedNormalCardNames,
    zNormalCardName
} from '@tichu-ts/shared/game_logic/CardConfig';
import { NativeSelectField, NativeSelectRoot, Theme } from '@chakra-ui/react';

const options = [
    <option value="" key="none"></option>,
    ...reversedNormalCardNames.map(
        cn => <option value={cn} key={cn}>{cn}</option>
    )  
];

export const PhoenixSelector: React.FC<{
    onAltNameChange: (newVal?: NormalCardName) => void,
}> = ({ onAltNameChange }) => {

    useEffect(() => {
        // "componentWillUnmount"
        return () => onAltNameChange();
      }, [onAltNameChange])

    const onSelection = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!e.target.value) {
            onAltNameChange();
        }
        else {
            const selectedName = zNormalCardName.parse(e.target.value);
            onAltNameChange(selectedName);
        }
    }, [onAltNameChange]);
    
    return (
        <div className={styles.phoenixSelectionContainer}>
            <span style={{paddingLeft: '1%'}}>
                Selected:
            </span>
            <Theme appearance="dark" hasBackground={false}>
                <NativeSelectRoot variant={'subtle'}>
                    <NativeSelectField
                        onChange={onSelection}
                        color='white' fontSize='1em' h='1.6em'
                    >
                        {options}
                    </NativeSelectField>
                </NativeSelectRoot>
            </Theme>
            
        </div>            
    );
}
