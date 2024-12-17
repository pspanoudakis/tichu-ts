import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";

export const GenericButton: React.FC<
    ButtonProps & React.RefAttributes<HTMLButtonElement>
> = (props) => {
    return (
        <Button
            variant='solid' colorPalette='cyan'
            h='2.4em'
            fontSize='1.5vh'
            {...props}
        >
            {props.children}
        </Button>
    )
}
