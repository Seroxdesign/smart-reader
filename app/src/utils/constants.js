const goerliUrl =
  'https://api.thegraph.com/subgraphs/name/psparacino/smart-reader-goerli';
const alchemyPolygonUrl = process.env.REACT_APP_ALCHEMY_POLYGON_ENDPOINT;
const alchemyMainnetUrl = process.env.REACT_APP_ALCHEMY_MAINNET_ENDPOINT;
const ipfsGateway = 'https://smart-reader.infura-ipfs.io/ipfs';
const projectId = process.env.REACT_APP_WALLETCONNECT_PROJECT_ID;
const honeybadgerApiKey = process.env.REACT_APP_HONEYBADGER_API_KEY;
const contractsDatabase = 'contract-data';

const functionMessages = [
  'Deciphering the function',
  'Unpacking the function',
  'Analyzing the function',
  'Interpreting the function',
  'Uncovering the function',
];

const contractMessages = [
  "Unravelling the contract's source code",
  "Cracking the contract's source code",
  "Decoding the contract's source code",
  "Decrypting the contract's source code",
  "Unveiling the contract's source code",
];

const explanation = {
  contract: 'contract',
  function: 'function',
  dependency: 'dependency',
};


module.exports = { goerliUrl, ipfsGateway, contractsDatabase, functionMessages, contractMessages, explanation, alchemyMainnetUrl, alchemyPolygonUrl, projectId, honeybadgerApiKey };

