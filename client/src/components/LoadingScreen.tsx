import { Flex, Spinner, Text } from "@chakra-ui/react"

export const LoadingScreen: React.FC<{
    label?: string
}> = ({ label }) => {
    return (
        <Flex
            colorPalette="cyan"
            flexDirection='column' justifyContent='center' alignItems='center'
            width='full' height='full' rowGap='1em'
        >
            <Spinner color="colorPalette.400" size='lg'/>
            { label && <Text color="colorPalette.400">{label}</Text>}
        </Flex>
    )
};
