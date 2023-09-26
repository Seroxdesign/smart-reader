import { ethers } from 'ethers';
import { Honeybadger } from "@honeybadger-io/react";

const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Takes an address and provider and returns true if the address is a contract
 * @param {*} address
 * @param {*} provider
 * @returns {boolean} true if the address is a contract
 */
const isContract = async (address) => {
  if (!address || address.length !== 42 || !address.startsWith('0x'))
    return false;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const code = await provider.getCode(address);
  return code && code !== '0x';
};

/**
 * Validates the input address as a contract address and returns a result and message. Also checks if the user is connected to a wallet.
 *
 * @param {*} input
 * @param {*} user
 * @param {*} validationResult
 * @param {*} setValidationResult
 * @returns
 */
const validateContractAddress = (
  input,
  user,
  validationResult,
  setValidationResult,
  setAddress,
  toast
) => {
  let message = '';
  if (!input) setValidationResult({ result: true, message: '' });

  if (!user || user === '') {
    setValidationResult({
      result: false,
      message: 'Please connect your wallet to use the dApp',
    });
    return;
  }

  if (input.length === 42 && input.startsWith('0x')) {
    isContract(input).then((result) => {
      if (result) {
        message = `${input} is a valid contract address`;

        setValidationResult({
          result: true,
          message,
        });
        return {
          result: true,
          message,
        };
      } else {
        message =
          `${input} is not a contract or exists on a different network. Please check and try again.`;

        setValidationResult({
          result: false,
          message,
        });
        return {
          result: false,
          message,
        };
      }
      setAddress(input)
    });
    message = 'Address is valid';
  } else if (input.length < 42 && input.startsWith('0x')) {
    message = 'Address is too short';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    };
  } else if (input.length === 42 && !input.startsWith('0x')) {
    message = 'Address is missing 0x prefix';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    };
  } else if (input.length < 42 && !input.startsWith('0x')) {
    message = 'Address is too short and missing 0x prefix';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    };
  } else if (input.length > 42 && input.startsWith('0x')) {
    message = 'Address is too long';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    };
  } else if (input.length > 42 && !input.startsWith('0x')) {
    message = 'Address is too long and missing 0x prefix';

    setValidationResult({
      result: false,
      message,
    });

    return {
      result: false,
      message,
    };
  } else {
    setValidationResult({ result: false, message: '' });
  }
};

const lowercaseAddress = (address) => {
  return address.toLowerCase();
};

const errorHandler = (error) => {
  /* would be nice to use something like honeybadger here */
    // Honeybadger.notify(error);
  console.log(error);
  };

export { shortenAddress, isContract, validateContractAddress, errorHandler, lowercaseAddress };
