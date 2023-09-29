import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {
    EthereumClient,
    w3mConnectors,
    w3mProvider,
} from '@web3modal/ethereum';
import React from 'react';
import { Web3Modal } from '@web3modal/react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { mainnet, polygon } from 'wagmi/chains';
import { AboutPage } from './pages/About';
import { HomePage } from './pages/Home';
import { projectId} from './utils/constants';
import { SupabaseProvider } from './utils/supabaseContext';

export const Context = React.createContext();

function App() {
    const chains = [mainnet, polygon];

    const { publicClient } = configureChains(chains, [
        w3mProvider({ projectId }),
    ]);

    const wagmiClient = createConfig({
        autoConnect: false,
        connectors: w3mConnectors({
            version: '1',
            appName: 'smartreader',
            chains,
            projectId,
        }),
        publicClient,
    });

    const ethereumClient = new EthereumClient(wagmiClient, chains);

    return (
        <SupabaseProvider>
            <WagmiConfig config={wagmiClient}>
                <Router>
                    <Routes>
                        <Route exact path="/" element={<HomePage />} />
                        <Route path="about" element={<AboutPage />} />
                    </Routes>
                </Router>
                <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
            </WagmiConfig>
        </SupabaseProvider>

    );
}

export default App;
