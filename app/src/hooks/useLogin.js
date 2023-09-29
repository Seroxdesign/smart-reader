import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { useAccount } from 'wagmi';
import postData from '../utils/api.js';
import { useSupabase } from '../utils/supabaseContext';
import jwtDecode from 'jwt-decode';
import { setCookie, removeCookie } from 'typescript-cookie';
import { useSignMessage } from 'wagmi';
import { useToast } from '@chakra-ui/react';
import { errorHandler } from '../utils/helpers';

const useLogin = () => {
    const message = `I am signing this message to authenticate my address with my account on Smart Reader.` // TODO could add nonce for extra security
    const { signMessageAsync } = useSignMessage({
        message,
    });
    const { supabase, setToken } = useSupabase();
    const { address: userAddress } = useAccount();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const toast = useToast();

    const checkLoggedIn = useCallback(() => {
        const token = Cookies.get('supabasetoken');
        if (!token) {
            // Prompt the user to log in or sign up.
            setIsLoggedIn(false);
            return false;
        } else {
            // Use Supabase client to set the session:
            const decodedToken = jwtDecode(token);
            // Check if it's expired
            const currentTime = Date.now() / 1000; // in seconds
            if (decodedToken.exp < currentTime) {
                setIsLoggedIn(false);
                return false;
            } else {
                setIsLoggedIn(true);
                return true;
            }
        }
    }, []);

    async function login() {
        try {
            setIsLoggingIn(true);
            // get nonce from api/nonce
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
            setCookie('supabasetoken', token);
            setIsLoggingIn(false);
            setIsLoggedIn(true);
        } catch (error) {
            console.log('error', error);
            setIsLoggedIn(false);
            setIsLoggingIn(false);
            setToken('');
            errorHandler(error);
            toast({
                title: 'Error',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }

    async function logout() {
        setCookie('supabasetoken', '');
        setIsLoggedIn(false);
        setIsLoggingIn(false);
        setToken('');
        removeCookie('supabasetoken');
    }

    return {
        login,
        logout,
        supabase,
        isLoggedIn,
        isLoggingIn,
        setIsLoggedIn,
        setIsLoggingIn,
        checkLoggedIn
    };
};

export default useLogin;
