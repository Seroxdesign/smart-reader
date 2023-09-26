import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalOverlay, Box, ModalBody, ModalCloseButton, Flex, Text, Image, Spinner } from '@chakra-ui/react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { SimulateTransaction } from '../SimulateTransaction';
import Viewer from '../MarkdownViewer';

export default function CodeModal({
  isOpenSimulate,
  onCloseSimulate,
  inspectFunction,
  functionExplanation,
  isLoadingFunction,
  functionMessages,
  address,
  network,
  contractABI,
  userAddress,
  isConnected
}) {
  return (
    <Modal isOpen={isOpenSimulate} onClose={onCloseSimulate} size="7xl">
      <ModalOverlay />
      <ModalContent
        minW="800px"
        w="75%"
        borderRadius={16}
        overflow={'y'}
      >
        <ModalHeader
          background="#262545"
          position="relative"
          mt={2}
          mx={2}
          color="white"
          borderTopRadius={16}
          justifyItems="space-between"
        >
          <code>Simulate function: {inspectFunction.name}</code>
          <ModalCloseButton color="white" top="25%" />
        </ModalHeader>
        <ModalBody py={6}>
          <Box
            flexGrow={0}
            w="100%"
            h="100%"
            overflowY="auto"
            pb={8}
            borderRadius="xl"
          >
            {inspectFunction &&
              Object.values(inspectFunction).every((value) => !value) ? null : (
              <Flex flexDirection={'column'} gap={3}>
                <Flex gap={3}>
                  <Flex
                    flexGrow={1}
                    w="50%"
                    maxH="600px"
                    overflowY="auto"
                    direction="column"
                    gap={3}
                  >
                    <Flex gap={3}>
                      <Image src="/images/sourcecode.png" w={6} />
                      <Text fontWeight="bold"> Source code </Text>
                    </Flex>
                    <Flex
                      p={2}
                      bg="#101D42"
                      overflow="hidden"
                        borderRadius={16}
                        sx={{
                          "pre": {
                            bgColor: '#101D42!important',
                          }
                        }}
                    >
                      <SyntaxHighlighter
                        language="javascript"
                        style={dracula}
                        wrapLines={true}
                        wrapLongLines={true}
                      >
                        {inspectFunction.code ? inspectFunction.code : ''}
                      </SyntaxHighlighter>
                    </Flex>
                  </Flex>

                  <Box
                    flexGrow={1}
                    w="50%"
                    maxH="600px"
                    overflowY="auto"
                    direction="column"
                    gap={3}
                  >
                    {isLoadingFunction && (
                      <Flex
                        w="full"
                        h="full"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection={'column'}
                        rowGap={3}
                      >
                        <Spinner />
                        <Text>
                          {functionMessages[Math.floor(Math.random() * 5)]}
                        </Text>
                      </Flex>
                    )}

                    {!isLoadingFunction && (
                      <Flex direction="column" gap={3} h="full">
                        <Flex gap={3}>
                          <Image src="/images/explanation.png" w={6} />
                          <Text fontWeight="bold">Explanation</Text>
                        </Flex>
                        <Flex
                          px={4}
                          borderRadius={16}
                          flex={1}
                          h="full"
                          p={4}
                          sx={{
                            "p": {
                              color: 'var(--chakra-colors-chakra-body-text)',
                            }
                          }}>
                          <Viewer>
                            {functionExplanation}
                          </Viewer>
                        </Flex>
                      </Flex>
                    )}
                  </Box>
                </Flex>
                {inspectFunction && address && network && contractABI && (
                  <SimulateTransaction
                    address={address}
                    network={network}
                    contractABI={contractABI}
                    inspectFunction={inspectFunction}
                    userAddress={userAddress}
                    isConnected={isConnected}
                  />
                )}
              </Flex>
            )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
