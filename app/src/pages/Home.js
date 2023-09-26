import { Box, Flex, Text } from '@chakra-ui/react';
import { Main } from '../components/containers/Main';


export const HomePage = () => {
    return (
        <>
            <Flex
                position="relative"
                direction="column"
                h="full"
                p={6}
                bgGradient="radial(43.95% 43.95% at 30.69% 0%, #172F74 0.18%, #101D42 100%)"
                backgroundRepeat="no-repeat"
            >
                <Main />
                <Box position="absolute" inset={0} bgGradient="radial(53.95% 53.95% at 80.69% 66%, #172F74 0.18%, transparent 100%)" w="100%" h="100%" opacity="50%" zIndex={0} />
            </Flex>
        </>
    )
}
