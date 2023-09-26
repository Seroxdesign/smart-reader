const chainInfo = ({ chain }) => {
  let APIKEY;
  let ALCHEMY_API_KEY;
  let INFURA_API_KEY;
  let blockExplorerApi;
  let blockExplorerUrl;
  let alchemyUrl;
  let infuraUrl;

  if (chain?.id === 137) {
    blockExplorerApi = 'api.polygonscan.com/api';
    blockExplorerUrl = 'https://polygonscan.com';
    alchemyUrl = 'https://polygon-mainnet.g.alchemy.com/v2/';
    infuraUrl = 'https://polygon-mainnet.infura.io/v3/';
    APIKEY = process.env.REACT_APP_POLYGONSCAN_API_KEY;
    ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_POLYGON_API_KEY;
    INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;
  } else if (chain?.id === 1) {
    blockExplorerApi = 'api.etherscan.io/api';
    blockExplorerUrl = 'https://etherscan.io';
    alchemyUrl = 'https://eth-mainnet.g.alchemy.com/v2/';
    infuraUrl = 'https://mainnet.infura.io/v3/';
    APIKEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
    ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_MAINNET_API_KEY;
    INFURA_API_KEY = process.env.REACT_APP_INFURA_API_KEY;
  }

  return {
    APIKEY,
    ALCHEMY_API_KEY,
    INFURA_API_KEY,
    blockExplorerApi,
    blockExplorerUrl,
    alchemyUrl,
    infuraUrl
  };
};

export default chainInfo;
