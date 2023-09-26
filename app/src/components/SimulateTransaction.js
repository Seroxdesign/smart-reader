import axios from 'axios';
import {
  Box,
  Input,
  Button,
  Flex,
  Spinner,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const simulatingFunctionMessages = [
  'Plotting the function ...',
  'Calculating the function ... ',
  'Demonstrating the function ... ',
  'Evaluating the function ...',
  'Applying the function ...',
];

export const SimulateTransaction = ({
  address,
  network,
  contractABI,
  inspectFunction,
  userAddress,
  isConnected,
}) => {
  const [simulationValid, setSimulationValid] = useState(false);
  const [simulationReady, setSimulationReady] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState();

  const [functionInputs, setFunctionInputs] = useState([]);
  const [encodedInput, setEncodedInput] = useState('');
  const [inputTypeError, setInputTypeError] = useState(false);
  const [txnFrom, setTxnFrom] = useState(isConnected ? userAddress : '');
  const { name, code } = inspectFunction;

  const {
    REACT_APP_TENDERLY_USER,
    REACT_APP_TENDERLY_PROJECT,
    REACT_APP_TENDERLY_ACCESS_KEY,
  } = process.env;

  const chainId = {
    ethereum: 1,
    polygon: 137,
  };

  useEffect(() => {
    if (functionInputs) {
      const inputValues = Object.values(functionInputs);
      if (inputValues.length === 0) {
        setSimulationReady(true);
      } else {
        let ready = true;
        inputValues.forEach((param) => {
          if (param.value.length === 0 || inputTypeError) {
            ready = false;
          }
        });
        setSimulationReady(ready);
      }
    }
  }, [functionInputs, inputTypeError]);

  // useEffect(() => {
  //   if (functionInputs || txnFrom) {
  //     // if each of the functionInputs has a value, and txnFrom is a valid address, then set simulationReady to true
  //     if (
  //       Object.values(functionInputs).every(
  //         (param) => param.value.length > 0
  //       ) &&
  //       ethers.utils.isAddress(txnFrom)
  //     ) {
  //       setSimulationReady(true);
  //     } else {
  //       setSimulationReady(false);
  //     }
  //   }
  // }, [functionInputs, inputTypeError, txnFrom]);

  useEffect(() => {
    if (simulationReady) {
      const inputTypes = Object.values(functionInputs).map(
        (param) => param.type
      );

      const inputValues = Object.values(functionInputs).map(
        (param) => param.value
      );

      if (inputValues.some((value) => value === '')) {
        setEncodedInput('');
        setSimulationReady(false);
        return;
      }

      const encodedParams = ethers.utils.defaultAbiCoder.encode(
        inputTypes,
        inputValues
      );

      setEncodedInput(encodedParams);
    }
  }, [encodedInput, functionInputs, simulationReady]);

  useEffect(() => {
    if (name && contractABI) {
      const abiArray = JSON.parse(contractABI);
      abiArray.forEach((abi) => {
        if (
          abi.name &&
          abi.name.toLowerCase().trim() === name.toLowerCase().trim()
        ) {
          setSimulationValid(true);
          const { inputs } = abi;
          const inputsObj = inputs.reduce((params, input) => {
            params[input.name] = { type: input.type, value: '' };
            return params;
          }, {});
          setFunctionInputs(inputsObj);
        }
      });
    }
  }, [name, contractABI]);
  const transaction = async () => {
    setIsSimulating(true);
    // network selector
    // map inputs
    // encode inputs
    // how to set from field, maybe ERC@) or not at this point(?)

    const resp = await axios.post(
      `https://api.tenderly.co/api/v1/account/${REACT_APP_TENDERLY_USER}/project/${REACT_APP_TENDERLY_PROJECT}/simulate`,
      // the transaction
      {
        /* Simulation Configuration */
        save: false, // if true simulation is saved and shows up in the dashboard
        save_if_fails: false, // if true, reverting simulations show up in the dashboard
        simulation_type: 'full', // full or quick (full is default)

        network_id: chainId[network], // network to simulate on

        /* Standard EVM Transaction object */
        // for testing
        // from: '0xdc6bdc37b2714ee601734cf55a05625c9e512461',
        // to: '0x6b175474e89094c44da98b954eedeac495271d0f',
        from: txnFrom,
        to: address,
        input: encodedInput,
        gas: 8000000,
        gas_price: 0,
        value: 0,
      },
      {
        headers: {
          'X-Access-Key': REACT_APP_TENDERLY_ACCESS_KEY,
        },
      }
    );

    setIsSimulating(false);
    setSimulationResult(resp.data.transaction);
  };

  const handleAddressInputChange = (e, setInputTypeError) => {
    const inputValue = e.target.value;
    if (!ethers.utils.isAddress(inputValue)) {
      setInputTypeError(inputValue.length > 0);
    } else {
      setInputTypeError(false);
    }
    return inputValue;
  };

  return (
    <Flex direction="column">
      {simulationValid ? (
        <Flex direction="column" gap={3}>
          <code>Params:</code>
          <Flex gap={2} direction="column">
            <Input
              value={txnFrom}
              onChange={(e) =>
                setTxnFrom(handleAddressInputChange(e, setInputTypeError))
              }
              placeholder="Which account is sending this txn?"
              borderColor={inputTypeError ? 'red' : 'gray.300'}
              _focus={{ borderColor: inputTypeError ? 'red' : 'blue.400' }}
            />
          </Flex>
          {Object.keys(functionInputs).map((key, index) => (
            <Box key={index}>
              Param: {key} Type: {functionInputs[key].type}
              <Input
                value={functionInputs[key].value}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  switch (functionInputs[key].type) {
                    case 'address':
                      if (!ethers.utils.isAddress(inputValue)) {
                        setInputTypeError(inputValue.length > 0);
                      } else {
                        setInputTypeError(false);
                      }
                      break;
                    case 'uint256':
                      if (!/^\d+$/.test(inputValue)) {
                        setInputTypeError(inputValue.length > 0);
                      } else {
                        setInputTypeError(false);
                      }
                      break;
                    default:
                      setInputTypeError(false);
                      break;
                  }
                  setFunctionInputs({
                    ...functionInputs,
                    [key]: { ...functionInputs[key], value: inputValue },
                  });
                }}
                borderColor={inputTypeError ? 'red' : 'gray.300'}
                _focus={{ borderColor: inputTypeError ? 'red' : 'blue.400' }}
              />
            </Box>
          ))}
          <Button isDisabled={!simulationReady} onClick={transaction}
          sx=
          {{
            backgroundColor: '#101D42',
            color: 'white',
            _hover: {
              backgroundColor: '#101D88',
            }
          }}
          >
            Simulate Transaction
          </Button>
          <Flex justifyContent="center">
            {isSimulating && (
              <Flex w="full" justifyContent="center" alignItems="center">
                <Spinner />
                <Text ml={2}>
                  {simulatingFunctionMessages[Math.floor(Math.random() * 5)]}
                </Text>
              </Flex>
            )}
            {simulationResult && !isSimulating && (
              <VStack pb={3} w="full">
                {/* <Text>Status: {simulationResult?.status}</Text> */}
                <TableContainer w="full">
                  <Table size="sm">
                    <TableCaption>Transaction results</TableCaption>
                    <Tbody>
                      <Tr>
                        <Td>Gas Used:</Td>
                        <Td>{simulationResult?.gas_used}</Td>
                      </Tr>
                      <Tr>
                        <Td>Block Number</Td>
                        <Td>{simulationResult?.block_number}</Td>
                      </Tr>
                      <Tr>
                        <Td>Hash</Td>
                        <Td>{simulationResult?.hash}</Td>
                      </Tr>
                      <Tr>
                        <Td>Sender</Td>
                        <Td>{simulationResult?.from}</Td>
                      </Tr>
                      <Tr>
                        <Td>Recipient</Td>
                        <Td>{simulationResult?.to}</Td>
                      </Tr>
                      <Tr>
                        <Td>Timestamp</Td>
                        <Td>{simulationResult?.timestamp}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </VStack>
            )}
          </Flex>
        </Flex>
      ) : (
        <p>
          This transaction cannot be simulated. The function is either internal
          or private.
        </p>
      )}
    </Flex>
  );
};
