import React from "react";
import { GenericButton } from "./ui/GenericButton";
import { LuInfo } from'react-icons/lu';
import { PopoverArrow, PopoverContent, PopoverRoot, PopoverTrigger } from "./ui/popover";
import { Flex, PopoverBody, Text } from "@chakra-ui/react";

export const SessionDetailsButton: React.FC<{
    roomId: string,
    winningScore: number,
}> = ({ roomId, winningScore }) => {

    return (
        <PopoverRoot>
            <PopoverTrigger asChild>
            <GenericButton w='2em'>
                <LuInfo/>
            </GenericButton>
            </PopoverTrigger>
            <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
                <Flex columnGap='0.25em'>
                    <Text fontWeight="medium">Winning Score: </Text>{winningScore}
                </Flex>
                <Flex columnGap='0.25em'>
                    <Text fontWeight="medium">Room ID:</Text>{roomId}
                </Flex>
            </PopoverBody>
            </PopoverContent>
        </PopoverRoot>
    );
};
