import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import postData from '../../utils/api.js';
import { useSupabase } from '../../utils/supabaseContext.js';
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from 'wagmi';
import { Button, Spinner } from '@chakra-ui/react';
import { ethers } from 'ethers';
import { useSignMessage } from 'wagmi';
import { setCookie } from 'typescript-cookie';

export const Login = () => {
  const [message, setMessage] = React.useState(
    `I am signing this message to authenticate my address with my account on Smart Reader.` // TODO could add nonce for extra security
  );
  const { signMessageAsync } = useSignMessage({
    message,
  });
  const { supabase, setToken } = useSupabase();
  const {
    address: userAddress,
    isConnected,
    isConnecting,
    isDisconnected,
  } = useAccount();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function login() {
    setIsLoggingIn(true);
    const nonce = await postData(
      process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL + 'nonce',
      {
        address: userAddress,
      }
    );
    const msg = await signMessageAsync();

    // post sign message to api/verify with nonce and address
    const loginResponse = await postData(
      process.env.REACT_APP_EDGE_FUNCTIONS_BASE_URL + 'login',
      {
        signed: msg,
        nonce: nonce.nonce,
        address: userAddress,
      }
    );
    const token = loginResponse.token;
    setCookie('supabasetoken', loginResponse.token);
    setIsLoggingIn(false);
    setIsLoggedIn(true);
    setToken(token);
  }

  return (
    <>
      {isConnected && (
        <Button
          background="transparent"
          color="whiteAlpha.700"
          _hover={{ background: 'transparent', color: 'white' }}
          border="2px solid white"
          borderRadius="full"
          onClick={login}
        >
          {isLoggingIn && <Spinner size="xs" mr={2} />}{' '}
          {isLoggedIn ? 'Log out' : isLoggingIn ? 'Logging in...' : 'Log in'}
        </Button>
      )}
    </>
  );
};
