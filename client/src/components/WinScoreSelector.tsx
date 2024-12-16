import React, { useCallback } from "react";
import {
    NativeSelectField,
    NativeSelectRoot,
} from "@chakra-ui/react";
import { Field } from "./ui/field";

const winningScores = [0, 500, 1000];

export const WinScoreSelector: React.FC<{
    onSelected: (i: number) => void,
}> = ({ onSelected }) => {

    const onChange: React.FormEventHandler<HTMLSelectElement> = useCallback(
        (e) => onSelected(Number(e.currentTarget.value)),
        [onSelected]
    );

    return (
        <Field label="Winning Score">
            <NativeSelectRoot variant={'subtle'}>
                <NativeSelectField onChange={onChange}>{
                    winningScores.map(s => 
                        <option key={s} label={s.toString()} value={s}>{s}</option>
                    )
                }</NativeSelectField>
            </NativeSelectRoot>
        </Field>
    );
}
