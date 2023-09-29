import { Button, Spinner, Tooltip, useToast } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi';
import React, { useEffect } from 'react'
import { mainnet } from 'wagmi/chains';
import { useWeb3Modal } from '@web3modal/react'
import { shortenAddress, lowercaseAddress } from '../utils/helpers'
import useLogin from '../hooks/useLogin';

export const ConnectButton = () => {
    const toast = useToast();
    const { open, setDefaultChain } = useWeb3Modal();
    const { login, logout, isLoggedIn, checkLoggedIn, isLoggingIn } = useLogin();
    const { disconnect } = useDisconnect();
    const {
        address: userAddress,
        isConnected,
        isConnecting,
        isDisconnected,
    } = useAccount({
        onDisconnect: async () => {
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
                }
            } catch (error) {
                console.log('OMG error', { error });
            }
        }

    });

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


    const handleConnectAndLogin = async () => {
        if (!isConnected) open({ route: 'ConnectWallet' });
        if (isConnected && !isLoggedIn) await login();
        if (isConnected && isLoggedIn) open({ route: 'Account' });
    }

    return (
        <Tooltip label={isConnected ? "Connect to login" : "Connect to login"} aria-label={isConnected ? "Account options" : "Connect to login"} bgColor="blue.500" fontWeight="600" hasArrow>
            <Button
                background="transparent"
                color="whiteAlpha.700"
                _hover={{ background: 'transparent', color: 'white' }}
                border="2px solid white"
                borderRadius="full"
                onClick={handleConnectAndLogin}
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