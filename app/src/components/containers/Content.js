import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  useClipboard,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount, useNetwork, useWalletClient } from 'wagmi';
import chainInfo from '../../utils/chainInfo';
import { contractsDatabase } from '../../utils/constants';
import { validateContractAddress } from '../../utils/helpers';
import { isContract } from '../../utils/helpers.js';
import { useSupabase } from '../../utils/supabaseContext';
import { Annotate } from '../Annotate';
import { Comments } from '../comments/Comments';
import { Files } from '../contract/Files';
import ConnectWalletWarning from '../common/ConnectWalletWarning';
import ContractMetaData from '../contract/ContractMetaData';
import CodeReader from '../code/CodeReader';
import CodeExplanation from '../code/CodeExplanation';
import CodeModal from '../code/CodeModal';
import Intro from '../Intro';
import { functionMessages, contractMessages, explanation } from '../../utils/constants';


export const Content = ({ address, fetching, setFetching }) => {

  // Hook Data
  const { chain } = useNetwork();
  const { APIKEY, blockExplorerApi, blockExplorerUrl, ALCHEMY_API_KEY, alchemyUrl } = chainInfo({ chain });
  const { onCopy, value, setValue, hasCopied } = useClipboard('');
  const { address: userAddress, isConnected } = useAccount();
  const { data: signer } = useWalletClient();
  const mainContentRef = useRef(null);
  const { supabase } = useSupabase();
  const toast = useToast();
  
  // Contract data state
  const [contractABI, setContractABI] = useState([]);
  const [contractExplanation, setContractExplanation] = useState('');
  const [contractName, setContractName] = useState('No contract');
  const [tokenData, setTokenData] = useState(null)
  const [functionExplanation, setFunctionExplanation] = useState('');
  const [explanationError, setExplanationError] = useState('');
  const [highlightedFunction, setHighlightedFunction] = useState(null);
  const [selectedFunctionName, setSelectedFunctionName] = useState(null);
  const [selectedFunctionCode, setSelectedFunctionCode] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const [isLoadingContract, setIsLoadingContract] = useState(false);
  const [isLoadingFunction, setIsLoadingFunction] = useState(false);
  const [sourceCode, setSourceCode] = useState([]);
  const [inspectContract, setInspectContract] = useState();
  const [inspectFunction, setInspectFunction] = useState({
    name: '',
    code: '',
  });
  const [isFetchingCreator, setIsFetchingCreator] = useState(false);

  const [contractCreation, setContractCreation] = useState({
    creator: '',
    creationTxn: '',
  });

  const [validationResult, setValidationResult] = useState({
    isValid: false,
    message: '',
  });

  const network = chain?.name?.toLowerCase();
  if (!address && userAddress) address = chain.id === 137 ? '0x0000000000000000000000000000000000001010' : '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';

  // Effects
  useEffect(() => {
    if (address && address.length > 0) {
      validateContractAddress(
        address,
        userAddress,
        validationResult,
        setValidationResult
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, chain?.id]);


  useEffect(() => {
    if (sourceCode && sourceCode.length > 0) {
      setInspectContract(sourceCode[0]);
      // console.log('sourceCode', sourceCode);
      const name = sourceCode[0].name ?? 'Name not found';

      fetchExplanation(
        false,
        sourceCode[0].sourceCode.content,
        // contractsArray[0].sourceCode.content,
        explanation.contract
      );
      const contractDisplayName = name.substring(name.lastIndexOf('/') + 1);
      setContractName(contractDisplayName);
    }
  }, [sourceCode, chain?.id]);

  // Utility functions for contracts and explanations
  const fetchExplanation = useCallback(
    async (dep, code, type, arrayId = '') => {

      let fileExplanationSuccess = false;

      // check if the explanation exists in the db
      const id = chain?.id + '-' + address;
      const { data: supabaseResponse, error } = await supabase
        .from(contractsDatabase)
        .select('*')
        .eq('contract_id', id);

      // Handle error during lookup
      if (error && !supabaseResponse) {
        console.log('Error: ', error);
        return;
      }
      if (supabaseResponse.length > 0) {
        let requiredField;
        if (type === explanation.contract && !dep) {
          requiredField = 'contract_explanation';
          setIsLoadingContract(true);
          if (supabaseResponse[0][requiredField] !== null) {
            console.log('Contract explanation exists');
            setContractExplanation(supabaseResponse[0][requiredField]);
            setIsLoadingContract(false);
            fileExplanationSuccess = true;
          }
        } else if (type === explanation.dependency) {
          requiredField = 'dependency_explanations';
          if (
            supabaseResponse[0][requiredField] !== null &&
            supabaseResponse[0][requiredField][arrayId] != null
          ) {
            fileExplanationSuccess = true;
          }
        } else {
          requiredField = 'function_explanations';
          setIsLoadingFunction(true);
          if (
            supabaseResponse[0][requiredField] !== null &&
            supabaseResponse[0][requiredField][arrayId] !== null
          ) {
            setFunctionExplanation(supabaseResponse[0][requiredField][arrayId]);
            setIsLoadingFunction(false);
            fileExplanationSuccess = false;
          }
        }
      }
      if (!fileExplanationSuccess) {
        let content;
        let requiredField;
        if (type === explanation.contract) {
          requiredField = 'contract_explanation';
          content = `Give me an advanced level summary of ${code} and analyse if the code has any potential vulnerabilities that could be used for malicious purposes. Please use markdown formatting in all responses`;
          setIsLoadingContract(true);
        } else if (type === explanation.dependency) {
          requiredField = 'dependency_explanations';
          content = `Give me a simple explanation of the following solidity file or dependency: ${code}`;
        } else {
          requiredField = 'function_explanations';
          content = `Give me a simple explanation of the following solidity code: ${code}`;
          setIsLoadingFunction(true);
        }
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:
              'Bearer ' + String(process.env.REACT_APP_OPENAI_API_KEY),
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo-16k',
            messages: [
              { role: 'system', content: 'You are a great teacher.' },
              {
                role: 'user',
                content,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          }),
        };

        fetch('https://api.openai.com/v1/chat/completions', requestOptions)
          .then((response) => response.json())
          .then(async (data) => {
            console.log('data', data);
            if (data.error) {
              let errorMessage = '';
              if (data.error.type === 'context_length_exceeded') {
                errorMessage = 'The contract code is too long.';
                throw new Error(errorMessage);
              } else {
                errorMessage = `Something went wrong. Please try again or check another contract. ${data.error.type}: ${data.error.message}`;
                throw new Error(errorMessage);
              }
            }
            const contract = {
              contract_id: chain.id + '-' + address,
            };
            if (type === explanation.contract) {
              setContractExplanation(data.choices[0].message.content);
              setIsLoadingContract(false);
              // insert the new explanation into the database
              contract['dependency_explanations'] =
                data.choices[0].message.content;
              const { data: updatedData, error: updateError } = await supabase
                .from(contractsDatabase)
                .update(contract)
                .eq('contract_id', id);
              // Handle error during update
              if (updateError && !updatedData) {
                return;
              }
            } else if (type === explanation.dependency) {
              contract[requiredField] = supabaseResponse[0][requiredField];
              if (contract.requiredField === null) {
                contract[requiredField] = {};
              }
              contract[requiredField][arrayId] =
                data.choices[0].message.content;
              const { data: updatedData, error: updateError } = await supabase
                .from(contractsDatabase)
                .update(contract)
                .eq('contract_id', id);
              // Handle error during update

              if (updateError && !updatedData) {
                console.log('Update Error: ', updateError);
                return;
              }
            } else {
              setFunctionExplanation(data.choices[0].message.content);
              // contract[requiredField] = supabaseResponse[0][requiredField];
              if (
                !contract[requiredField] ||
                contract[requiredField] === null
              ) {
                contract[requiredField] = {};
              }
              contract[requiredField][arrayId] =
                data.choices[0].message.content;
              const { data: updatedData, error: updateError } = await supabase
                .from(contractsDatabase)
                .update(contract)
                .eq('contract_id', id);
              // Handle error during update

              if (updateError && !updatedData) {
                console.log('Update Error: ', updateError);
                return;
              }

              console.log('Item updated!', updatedData);
              setIsLoadingFunction(false);
            }
          })
          .catch((err) => {
            setIsLoadingContract(false);
            setIsLoadingFunction(false);
            setExplanationError(err.message);
            console.log('open ai fetch error', err);
          });
      }
    },
    [
      explanation.contract,
      explanation.dependency,
      inspectContract,
      address,
      signer,
      network,
      chain?.id,
    ]
  );

  function extractContracts(contractString) {
    try {
      const contractsArray = [];

      let contractStart = contractString?.indexOf('contract ');
      let braceCount = 0;
      let i = contractStart;

      while (i < contractString.length) {
        if (contractString[i] === '{') {
          braceCount++;
        } else if (contractString[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            contractsArray.push(contractString.slice(contractStart, i + 1));
            contractStart = contractString.indexOf('contract ', i + 1);
          }
        }
        i++;
      }
      const contracts = {};
      Object.entries(contractsArray).forEach(([index, sourceCode]) => {
        const nameStart = sourceCode.indexOf('contract ') + 9;
        const nameEnd = sourceCode.indexOf(' ', nameStart);
        const name = sourceCode.slice(nameStart, nameEnd);

        contracts[name] = { content: sourceCode };
      });

      return contracts;
    } catch (error) {
      console.log('Error extracting contracts:', error);
    }
  }

  async function createItemIfNotExists(
    database,
    id,
    idName,
    requiredFields,
    setFunctions,
    createFunction
  ) {
    // Check if item exists
    console.log('Checking if item exists in database ', id);
    const { data, error } = await supabase
      .from(database)
      .select('*')
      .eq(idName, id);

    // Handle error during lookup
    if (error && !data) {
      console.log('Error: ', error);
      return;
    }

    // If the item exists, update it
    if (data.length > 0) {
      console.log('Item exists!', data);
      // TODO add logic for checking last update and only updating if it's been more than a set period of time
      let allFieldsExist = true; // Initialize flag
      // data[0]; // Get first item in array
      for (let i = 0; i < requiredFields.length; i++) {
        if (
          data &&
          data[0] &&
          data[0].hasOwnProperty(requiredFields[i]) &&
          (data[0][requiredFields[i]] === null ||
            Object.keys(data[0][requiredFields[i]]).length === 0)
        ) {
          allFieldsExist = false;
          console.log('Object is empty');
          break;
        }

      }

      if (allFieldsExist) {
        for (let i = 0; i < setFunctions.length; i++) {
          setFunctions[i](data[0][requiredFields[i]]);
        }
        return data[0];
      } else {
        console.log('Not all fields exist');
      }
      const item = await createFunction();
      const { data: updatedData, error: updateError } = await supabase
        .from(database)
        .update(item)
        .eq(idName, id);
      // Handle error during update
      if (updateError && !updatedData) return;
    }
    // If the item does not exist, insert it
    else {
      const item = await createFunction();
      const { data: insertedData, error: insertError } = await supabase
        .from(database)
        .insert([item]);
      // Handle error during insert
      if (insertError && !insertedData) return;
    }
  }

  const fetchCreatorAndCreation = useCallback(async () => {
    if (!userAddress || userAddress === '') return;
    if (!address) return;
    if (!(await isContract(address))) return;

    await createItemIfNotExists(
      contractsDatabase,
      chain.id + '-' + address,
      'contract_id',
      ['creation_info'],
      [setContractCreation],
      async () => {
        const apiModule = 'contract';
        const apiAction = 'getcontractcreation';
        let creationInfo = {
          creator: '',
          creationTxn: '',
        };
        try {
          setIsFetchingCreator(true);
          const response = await axios.get(
            `https://${blockExplorerApi}?module=${apiModule}&action=${apiAction}&contractaddresses=${address}&apikey=${APIKEY}`
          );

          creationInfo = {
            creator: response.data.result[0].contractCreator,
            creationTxn: response.data.result[0].txHash,
          };
        } catch (error) {
          console.log('Error fetching contract creation:', error);
        }

        const contract = {
          contract_id: chain.id + '-' + address,
          creation_info: creationInfo,
        };

        setIsFetchingCreator(false);
        return contract;
      }
    );
  }, [address, blockExplorerApi, chain, APIKEY]);



  const fetchTokenData = useCallback(async (address) => {
    try {
        const apiUrl = `${alchemyUrl}${ALCHEMY_API_KEY}`;
        if (!address) return null;
        const options = {
            method: 'POST',
            url: apiUrl,
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            data: {
                id: chain?.id,
                jsonrpc: '2.0',
                method: 'alchemy_getTokenMetadata',
                params: [address],
            }
        }

        const res = await axios(options);
        const { name, logo, symbol } = res?.data?.result;
        setTokenData({
            name,
            logo,
            symbol,
        });
    } catch (error) {
        // toast({
        //     title: 'Error',
        //     description: error.message,
        //     status: 'error',
        //     duration: 5000,
        //     isClosable: true,
        // });
        setContractName('Unknown');
    }
}, [ALCHEMY_API_KEY, alchemyUrl, chain?.id, toast]);

  const fetchSourceCode = useCallback(async () => {
    if (!userAddress || userAddress === '') return;
    if (!(await isContract(address))) return;

    await createItemIfNotExists(
      contractsDatabase,
      chain.id + '-' + address,
      'contract_id',
      ['source_code', 'abi'],
      [setSourceCode, setContractABI],
      async () => {
        try {
          let resp = await axios.get(
            `https://${blockExplorerApi}?module=contract&action=getsourcecode&address=${address}&apikey=${APIKEY}`
          );
          let sourceObj;
          let contracts;
          let contractsArray;
          if (resp.data.result[0].Implementation) {
            resp = await axios.get(
              `https://${blockExplorerApi}?module=contract&action=getsourcecode&address=${resp.data.result[0].Implementation}&apikey=${APIKEY}`
            );
          }
          if (!resp.data.result[0].SourceCode) {
            const message = `No source code found for ${address}. Are you on the correct network?`;
            setValidationResult({
              isValid: false,
              message: message,
            });
            throw new Error(message);
          }
          try {
            sourceObj = JSON.parse(resp.data.result[0].SourceCode.slice(1, -1));

            contracts = sourceObj.sources;
          } catch {
            sourceObj = resp.data.result[0].SourceCode;
            contracts = extractContracts(sourceObj);
          }

          contractsArray = Object.entries(contracts).map(
            ([name, sourceCode]) => {
              return { name, sourceCode };
            }
          );
          const addressABI = JSON.parse(resp.data.result[0].ABI);

          const contract = {
            contract_id: chain.id + '-' + address,
            source_code: contractsArray,
            abi: addressABI,
          };

          fetchExplanation(
            false,
            contractsArray[0].sourceCode.content,
            explanation.contract
          );
          setFetching(false);
          toast({
            title: 'Contract found',
            description: `Contract ${contractsArray[0].name} found on ${chain.name}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
          return contract;
        } catch (err) {
          // Handle Error Here
          console.log('fetch source code error', err);
          setFetching(false);
          setSourceCode([]);
          setContractName('Unknown');
          setTokenData({'name': 'Unknown', 'logo': '', 'symbol': ''});
          setExplanationError('');
          setContractExplanation('');
          setInspectContract(undefined);
        }
      }
    );
  }, [address]);

  const handleContractChange = useCallback(
    async (e) => {
      setContractExplanation('');
      const selectedContract =
        e.target.querySelector('.dependency-name').innerText ||
        e.target.innerText;
      const contract = sourceCode.find(
        (contract) => contract.name === selectedContract
      );
      setContractName(selectedContract);
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 50;
      }
      const dep = true
      setInspectContract(contract);
      await fetchExplanation(
        dep,
        contract.sourceCode.content,
        explanation.contract,
        contract.name
      );
    },
    [explanation.contract, fetchExplanation, sourceCode]
  );

  const handleCodeHover = useCallback(
    (event) => {
      setHighlighted(true);
      const codeNode = event.target;
      const lineNode = codeNode.parentElement;
      const regexToRemoveSolidity = /\/\/\s*SPDX-License-Identifier:\s*MIT[\s\S]*?pragma solidity\s+\d+(\.\d+){0,2}\s*;/g;
      const regexToRemoveComments = /\/\*\*[\s\S]*?\*\//g;
      const stringWithoutSolidity = inspectContract?.sourceCode?.content.replace(regexToRemoveSolidity, '');
      const stringWithoutComments = stringWithoutSolidity?.replace(regexToRemoveComments, '');
      const stringToSplit = stringWithoutComments || stringWithoutSolidity || inspectContract?.sourceCode?.content;
      const functionsArray = stringToSplit?.split(/(?=function)/);
      // Remove the first empty element (as split() would create an empty element at the start)
      functionsArray?.shift();
      if (lineNode.nodeName === 'SPAN') {
        const childSpans = lineNode.querySelectorAll('span');

        childSpans.forEach((span, i) => {
          let foundFunction = false;
          if (span.innerText.includes('function')) {
            foundFunction = true;
            const codeBlock = lineNode.closest('pre');
            const codeLines = codeBlock.querySelectorAll('span');
            const startIndex = Array.from(codeLines).indexOf(lineNode);
            const closingBraceRegex = /}(\s)*$/;
            let endIndex = startIndex;
            while (!closingBraceRegex.test(codeLines[endIndex].innerText)) {
              endIndex++;
            }
         
            const highlightedLines = Array.from(codeLines).slice(
              startIndex,
              endIndex + 1
            );
            highlightedLines.forEach((line) => {
              line.classList.add('highlight');
            });
            setHighlightedFunction(highlightedLines);
            const highlightedText = highlightedLines
              .slice(1)
              .map((line) => line.innerText.trim())

            functionsArray?.forEach((func, i) => {
              if (highlightedText.join('').slice(0, 20) === func.replace(/\s/g, "").slice(0, 20)) {
                
                setSelectedFunctionCode(func)
              }
            })
          }
          if (foundFunction) {
            let nextSpan = span.nextElementSibling;
            let functionName = span.innerText.replace(/^.*function\s+/i, '');

            while (nextSpan) {
              const nextText = nextSpan.innerText.trim();
              const openParenIndex = nextText.indexOf('(');
              if (openParenIndex !== -1) {
                functionName += ' ' + nextText.substring(0, openParenIndex);
                break;
              } else if (nextText) {
                functionName += ' ' + nextText;
              }

              nextSpan = nextSpan.nextElementSibling;
            }

            const split = functionName.split(' ');

            if (split[0] === 'function') {
              split.shift();
            }

            let concatenatedFunctionName = '';
            for (let i = 0; i < split.length; i++) {
              if (split[i].includes('(')) {
                concatenatedFunctionName += split[i].split('(')[0];
                break;
              } else {
                concatenatedFunctionName += split[i];
              }
            }
            setSelectedFunctionName(concatenatedFunctionName);

            foundFunction = false;
          }
        });

      } else {
        if (highlightedFunction) {
          highlightedFunction.forEach((line) => {
            line.classList.remove('highlight');
          });
          setHighlightedFunction(null);
        }
      }
    },
    [highlightedFunction]
  );

  const {
    isOpen: isOpenSimulate,
    onOpen: onOpenSimulate,
    onClose: onCloseSimulate,
  } = useDisclosure();
  const {
    isOpen: isOpenAnnotation,
    onOpen: onOpenAnnotation,
    onClose: onCloseAnnotation,
  } = useDisclosure();


  const handleCodeClick = useCallback(() => {
    if (!selectedFunctionName || !selectedFunctionCode) {
      return;
    }
    setFunctionExplanation('');

    onOpenSimulate();

    console.log('selectedFunctionCode', selectedFunctionCode);

    setInspectFunction({
      name: selectedFunctionName,
      code: selectedFunctionCode,
    });

    fetchExplanation(
      false,
      selectedFunctionCode,
      explanation.function,
      selectedFunctionName
    );
  }, [
    selectedFunctionName,
    selectedFunctionCode,
    onOpenSimulate,
    fetchExplanation,
    explanation.function,
  ]);

  useEffect(() => {
    if (address) {
      setFetching(true);
      fetchCreatorAndCreation(address);
    }
  }, [address, fetchCreatorAndCreation]);


  useEffect(() => {
    setExplanationError('');
    setContractExplanation('');
    fetchTokenData(address);
    fetchSourceCode();
  }, [fetching, fetchSourceCode, setFetching, address, chain?.id, fetchTokenData]);

  return (
    <Stack
      h={!userAddress ? "calc(100vh - 130px)" : "full"}
      w="full"
      alignItems={!userAddress ? "center" : "stretch"}
      justifyContent={!userAddress ? "center" : "flex-start"}
      background="#FFFFFF1A"
      backdropFilter="blur(8px)"
      p={6}
      borderRadius="8px"
      gap={8}
      zIndex={10}
    >
      {!userAddress ? (
        <ConnectWalletWarning />
      ) : undefined}

      {!userAddress ? (
        <Intro />
      ) : (
        <>
          <ContractMetaData
            contractName={contractName}
            validationResult={validationResult}
            address={address}
            userAddress={userAddress}
            setValue={setValue}
            onCopy={onCopy}
            hasCopied={hasCopied}
            blockExplorerUrl={blockExplorerUrl}
            contractCreation={contractCreation}
            isFetchingCreator={isFetchingCreator}
            value={value}
            tokenData={tokenData}
          />
          <Files
            sourceCode={sourceCode}
            selectedContract={contractName}
            handleClick={handleContractChange}
          />
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            alignItems="center"
            w="full"
            h={{ base: 'full', lg: 'lg' }}
          >
            <CodeReader
              inspectContract={inspectContract}
              handleCodeHover={handleCodeHover}
              handleCodeClick={handleCodeClick}
              id={`${chain?.id}-${address}`}
              setHighlighted={setHighlighted}
            />
            <CodeExplanation
              contractExplanation={contractExplanation}
              isLoadingContract={isLoadingContract}
              explanationError={explanationError}
              mainContentRef={mainContentRef}
              contractMessages={contractMessages}
            />
          </Flex>

          {address !== '' && <Comments chainId={chain?.id} contractAddress={address} />}
        </>
      )}

      <Modal isOpen={isOpenAnnotation} onClose={onCloseAnnotation}>
        <ModalOverlay />
        <ModalContent minW="800px" w="75%" maxH="calc(100% - 80px)" borderRadius={16}>
          <ModalHeader
            background="#262545"
            mt={2}
            mx={2}
            color="white"
            borderTopRadius={16}
            justifyItems="space-between"
          >
            <code>Annotate contract: {inspectContract?.name}</code>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody py={6}>
            <Annotate address={address} inspectContract={inspectContract} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <CodeModal
        isOpenSimulate={isOpenSimulate}
        onCloseSimulate={onCloseSimulate}
        inspectFunction={inspectFunction}
        functionExplanation={functionExplanation}
        isLoadingFunction={isLoadingFunction}
        functionMessages={functionMessages}
        address={address}
        network={network}
        contractABI={contractABI}
        userAddress={userAddress}
        isConnected={isConnected}
      />
    </Stack>
  );
};
