import React, { useEffect } from 'react';
import { Input, Image, Text, Flex, Link, Divider } from '@chakra-ui/react';

import { useState } from 'react';
import chainInfo from '../../utils/chainInfo';
import { useNetwork } from 'wagmi';
import { getContracts } from '../../utils/queries';

const SideMenu = () => {
  const [search, setSearch] = useState('');
  const [contracts, setContracts] = useState([]);
  const { chain } = useNetwork();
  const { blockExplorerUrl } = chainInfo({ chain });

  const queryContracts = async () => {
    const contracts = await getContracts();
    setContracts(contracts);
    console.log('contracts', contracts);
  };

  useEffect(() => {
    queryContracts();
  }, []);

  return (
    <Flex
      textColor="white"
      direction="column"
      w="full"
      overflowX="hidden"
      overflowY="auto"
      gap={3}
    >
      <Flex direction="column" mt="23px">
        <Flex alignItems="center" gap={3}>
          <Image src="images/logo.png" w={10} filter="invert()" />
          <Text fontWeight="bold">Smart Reader</Text>
        </Flex>

        <Divider my={3} />
        <Input
          mt={3}
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
      </Flex>
      <Flex direction="column" gap={1}>
        {contracts &&
          contracts
            .filter((contract) => {
              return (
                // contract.name.toLowerCase().includes(search.toLowerCase()) ||
                contract.mainContractAddress
                  .toLowerCase()
                  .includes(search.toLowerCase())
              );
            })
            .map((contract) => (
              <Link
                href={`${blockExplorerUrl}/address/${contract.mainContractAddress}`}
                key={contract.id}
              >
                <Flex justifyContent="space-between">
                  <Text>{`${contract.mainContractAddress.slice(
                    0,
                    7
                  )}...${contract.mainContractAddress.slice(
                    contract.mainContractAddress.length - 7
                  )}`}</Text>{' '}
                  <Text>({contract.Annotations.length})</Text>
                </Flex>
              </Link>
            ))}
      </Flex>
    </Flex>
  );
};

export default SideMenu;
