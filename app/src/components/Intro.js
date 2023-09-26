import { Flex, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { ConnectButton } from './ConnectButton'
import { Icon } from '@iconify/react';

export default function Intro() {

  return (
    <Stack gap={12} p={10}>

      <Flex flexDirection="column" alignItems="center" gap={2}>
        <Flex flexDirection="row" gap={2} alignItems="center">
          <Image src={'/images/document.svg'} />
          {/* This should be the name of the contract address the user plugs in */}
          <Heading as="h1" size="lg" fontWeight={600} noOfLines={1}>
            Smart Reader
          </Heading>
        </Flex>
        <Text fontSize="2xl">Your AI-powered smart contract reader</Text>
      </Flex>
      <Flex flexDirection="column" alignItems="center" gap={8} maxW="3xl" textAlign="center" fontSize="lg">

        <Text as="p">Unlock the power of blockchain with our AI-powered Smart Contract Reader. Gain instant insights into any smart contract*. </Text>
        <Text as="p">Simply connect your wallet, paste an address or use our search feature to find the contract you're interested in. Once loaded, select individual functions to get a plain-language explanation of what they do.</Text>
        <Text as="p" mt={-6} display="flex" alignItems="center" justifyContent="center" gap={1} textAlign="center" w="full" fontStyle="italic" color="whiteAlpha.700" fontSize="sm">*Supported networks: <Text as="span" display="inline-flex" alignItems="center" gap={1}><Icon icon="cryptocurrency:eth" /> Ethereum Mainnet</Text> and <Text as="span" display="inline-flex" alignItems="center" gap={1}><Icon icon="cryptocurrency:matic" inline fontSize="16px" /> Polygon PoS </Text></Text>
        <ConnectButton />
      </Flex>
    </Stack>
  )
}