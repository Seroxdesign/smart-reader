import React from 'react'
import { Box, Flex } from '@chakra-ui/react'
import { ArrowUpIcon } from '@chakra-ui/icons';

export default function () {
  return (
    <Box
      position={{ base: 'unset', lg: 'absolute' }}
      w="screen"
      h="12"
      top={{ base: 'unset', lg: 0 }}
      right={{ base: 'unset', lg: 0 }}
      zIndex={{ base: 'unset', lg: -1 }}
    >
      <Flex
        alignItems="center"
        justifyContent="space-around"
        h="full"
        p={3}
        borderRadius="xl"
        overflow="hidden"
      >
        Connect your wallet to use this dApp. <ArrowUpIcon />
      </Flex>
    </Box>
  )
}
