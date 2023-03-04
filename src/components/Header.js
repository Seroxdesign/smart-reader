import React from 'react';
import { Flex, Input, Tooltip, Button } from '@chakra-ui/react';
import { Web3NetworkSwitch, Web3Button } from '@web3modal/react';
import { ethers } from 'ethers';

export const Header = ({ address, setAddress, setFetching }) => {
  return (
    <Flex
      w="full"
      h={16}
      alignItems="center"
      background="#355CA7"
      backdropFilter="blur(8px)"
      zIndex={1}
      borderTopRadius={16}
      px={3}
      justifyContent="space-between"
    >
      <Flex gap={3}>
        <Input
          placeholder="Smart contract address"
          defaultValue={address}
          onChange={(e) => {
            console.log(e.target.value);
            console.log('address.current', address);
            setAddress(e.target.value);
          }}
          maxW="300px"
          background="#191919"
          textColor="white"
        />
        <Web3NetworkSwitch />

        <Tooltip
          isDisabled={ethers.utils.isAddress(address)}
          label="Please input a valid address"
          shouldWrapChildren
        >
          <Button
            onClick={() => setFetching(true)}
            isDisabled={!ethers.utils.isAddress(address)}
            background="black"
            textColor="white"
            _hover={{ background: 'black' }}
          >
            Go
          </Button>
        </Tooltip>
      </Flex>

      <Web3Button />
    </Flex>
  );
};
