const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    lacchain: {
      provider: () => new HDWalletProvider(PRIVATE_KEY, WEB3_RCP_URL),
      port: 8545,
      gas: 5000000,
      gasPrice: 0,
      networkId: 648529,
    }
  },
};
