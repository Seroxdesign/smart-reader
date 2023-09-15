import React, { useEffect } from 'react'
import { Stack, Flex, Heading, Image, Link, Button, Spinner, Text, Tooltip, useToast, useClipboard } from '@chakra-ui/react';
import { shortenAddress } from '../../utils/helpers';
import { CopyIcon } from '@chakra-ui/icons';

export default function ContractMetaData({
  contractName,
  validationResult,
  address,
  userAddress,
  blockExplorerUrl,
  contractCreation,
  isFetchingCreator,
  tokenData,
}) {
  const { onCopy, value, setValue, hasCopied } = useClipboard('');
  const toast = useToast();

  console.log({ tokenData, address });
  useEffect(() => {
    if (hasCopied) {
      toast({
        title: 'Copied to clipboard',
        description: `The contract address for ${tokenData.name} (${value}) has been copied to your clipboard.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
  }, [hasCopied, value]);

  useEffect(() => {
    if (address) {
      setValue(address);
    }
  }, [address]);

  return (
    <Stack>
      <Flex alignItems="center" gap={2}>
        <Image src={tokenData?.logo ? tokenData.logo : '/images/document.svg'} w={30} h={30} />
        {/* This should be the name of the contract address the user plugs in */}
        <Heading as="h1" size="lg" fontWeight={600} noOfLines={1}>
          {tokenData?.name && `${tokenData?.name}:`} {contractName}
        </Heading>
      </Flex>
      <Flex alignItems="center" w="full">
        {address && userAddress && validationResult.result ? (
          <>
            <Link
              href={`${blockExplorerUrl}/address/${address}`}
              fontSize="sm"
              color="#A4BCFF"
              isExternal
            >
              {shortenAddress(address)}
            </Link>
            <Tooltip label="Copy address" hasArrow>
              <Button
                variant="unstyled"
                size="sm"
                onClick={() => {
                  setValue(address);
                  console.log('value', value);
                  onCopy(value);
                }}
                position="relative"
              >
                <CopyIcon color="white" />
              </Button>
            </Tooltip>
          </>
        ) : (
          <Text fontSize="sm">
            {!userAddress
              ? 'Connect your wallet'
              : !validationResult.result
                ? 'No valid address'
                : 'No contract selected'}
          </Text>
        )}
      </Flex>
      <Heading as="h2" size="md" fontWeight={600} noOfLines={1}>
        CREATOR
      </Heading>

      {isFetchingCreator && (
        <Flex gap={1} alignItems="center">
          <Spinner size="xs" /> Fetching creator...
        </Flex>
      )}

      {!isFetchingCreator &&
        contractCreation &&
        contractCreation.creator !== '' &&
        validationResult.result ? (
        <Flex gap={1}>
          <Link
            href={`${blockExplorerUrl}/address/${contractCreation.creator}`}
            fontSize="sm"
            color="#A4BCFF"
            isExternal
          >
            {shortenAddress(contractCreation.creator)}
          </Link>
          <Text fontSize="sm">at txn</Text>
          <Link
            href={`${blockExplorerUrl}/tx/${contractCreation.creationTxn}`}
            fontSize="sm"
            color="#A4BCFF"
            isExternal
          >
            {shortenAddress(contractCreation.creationTxn)}
          </Link>
        </Flex>
      ) : (
        <Text fontSize="sm">
          {!userAddress
            ? 'Connect your wallet'
            : !validationResult.result
              ? 'No valid address'
              : 'No contract selected'}
        </Text>
      )}
    </Stack>
  )
}
