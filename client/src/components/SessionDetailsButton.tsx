import React, { useCallback } from "react";
import { GenericButton } from "./ui/GenericButton";
import { LuInfo } from "react-icons/lu";

export const SessionDetailsButton: React.FC<{}> = () => {

    const onClick = useCallback(() => {

    }, []);

    return (
        <GenericButton w='2em' onClick={onClick}>
            <LuInfo/>
        </GenericButton>
    );
};
