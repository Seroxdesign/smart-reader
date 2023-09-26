import { Button, Spinner, Tooltip, useToast } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi';
import React, { useEffect, useCallback } from 'react'
import { mainnet } from 'wagmi/chains';
import Cookies from 'js-cookie';
import { useWeb3Modal } from '@web3modal/react'
import { shortenAddress, lowercaseAddress } from '../utils/helpers'
import useLogin from '../hooks/useLogin';

export const ConnectButton = ({ address, setAddress, cta, isSimple = false }) => {
    const toast = useToast();
    const { open, setDefaultChain } = useWeb3Modal();
    const { login, logout, isLoggedIn, checkLoggedIn, isLoggingIn, setIsLoggedIn } = useLogin();
    const { disconnect } = useDisconnect();
    const {
        address: userAddress,
        isConnected,
        isConnecting,
        isDisconnected,
    } = useAccount({
        onDisconnect: async () => {
            setAddress('');
            disconnect();
            await logout();

            toast({
                title: 'Disconnected',
                description: 'You are now logged out.',
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
        },
        onConnect: async () => {
            try {
                // if (!isConnected) return;
                toast({
                    title: 'Connected',
                    description: 'Wallet connection successful.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
                // toast({
                //     title: 'Logging in',
                //     description: 'Logging you in to the app. Please wait...',
                //     status: 'info',
                //     duration: 0,

                // })
                const loggedIn = checkLoggedIn();
                if (!loggedIn) await login();

                if (loggedIn) {
                    toast({
                        title: 'Logged In',
                        description: 'You are now logged in.',
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                    });
                    // return;
                }
                // throw new Error('Not logged in');
            } catch (error) {
                console.log('OMG error', { error });
            }
        }

    });

    const handleLogin = useCallback(async () => {
        try {
            const token = Cookies.get('supabasetoken');
            const loggedIn = token.cookie ? true : false;
            console.log('logged in?', { loggedIn, token });

            if (loggedIn) {
                console.log('logged in?', { loggedIn, token });
                logout();
                setIsLoggedIn(false);
                toast({
                    title: 'Logged Out',
                    description: 'You are now logged out.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                await login();
                setIsLoggedIn(true);
                toast({
                    title: 'Logged In',
                    description: 'You are now logged in.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log('OMG error', { error });
            toast({
                title: 'Error',
                description: 'There was an error logging in.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [login, setIsLoggedIn]);

    const displayAddress = (address) => {
        let formattedAddress = address;
        if (address) {
            formattedAddress = lowercaseAddress(address);
            formattedAddress = shortenAddress(formattedAddress);

            return formattedAddress
        }
        return;
    }

    useEffect(() => {
        setDefaultChain(mainnet.chainId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const loggedIn = checkLoggedIn();

        if (isLoggedIn) {
            console.log('useeffect logged in?', { loggedIn });
        }
    }, []);




    return (
        <Tooltip label={isConnected ? "Connect to login" : "Connect to login"} aria-label={isConnected ? "Account options" : "Connect to login"} bgColor="blue.500" fontWeight="600" hasArrow>
            <Button
                    background="transparent"
                    color="whiteAlpha.700"
                    _hover={{ background: 'transparent', color: 'white' }}
                    border="2px solid white"
                    borderRadius="full"
                    onClick={() => (isConnected && !isLoggedIn ? login() : isConnected && isLoggedIn ? open({ route: 'Account' }) : open({ route: 'ConnectWallet' }))}
                >
                    {(isConnecting || isLoggingIn) && <Spinner size="xs" mr={2} />}{' '}
                    {!isLoggedIn && isConnected ? 'Login' : isConnected && isLoggedIn
                        ? displayAddress(userAddress)
                        : (isConnecting && !isDisconnected)
                            ? 'Connecting'
                            : 'Connect wallet'}
                </Button>
        </Tooltip>
    )
}

export const LoginButton = () => {
    const { login, logout, isLoggedIn, isLoggingIn, setIsLoggedIn } = useLogin();
    const toast = useToast();

    const handleLogin = useCallback(async () => {
        try {
            const token = Cookies.get('supabasetoken');
            const loggedIn = token.cookie ? true : false;
            console.log('logged in?', { loggedIn, token });

            if (loggedIn) {
                console.log('logged in?', { loggedIn, token });
                logout();
                setIsLoggedIn(false);
                toast({
                    title: 'Logged Out',
                    description: 'You are now logged out.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } else {
                await login();
                setIsLoggedIn(true);
                toast({
                    title: 'Logged In',
                    description: 'You are now logged in.',
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log('OMG error', { error });
            toast({
                title: 'Error',
                description: 'There was an error logging in.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        }
    }, [login, setIsLoggedIn]);

    // useEffect(() => {

    //     handleLogin


    return (
        <Button
            variant="link"
            color="link"
            display="inline-flex"
            alignItems="center"
            onClick={() => handleLogin()} isDisabled={isLoggingIn}>
            {isLoggingIn ? (
                <>
                    <Spinner /> {'logging In'}
                </>
                    ) : !isLoggedIn ? 'login' : 'logout'}
        </Button>
    )
}
