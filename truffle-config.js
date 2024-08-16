module.exports = {
  // Network settings
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 5000000,
      gasPrice: 20000000000
    },
    testnet: {
      provider: () => new Web3.providers.HttpProvider("https://testnet.infura.io/v3/YOUR_PROJECT_ID"),
      network_id: 4,
      gas: 5000000,
      gasPrice: 20000000000
    },
    mainnet: {
      provider: () => new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/YOUR_PROJECT_ID"),
      network_id: 1,
      gas: 5000000,
      gasPrice: 20000000000
    }
  },

  // Compiler settings
  compilers: {
    solc: {
      version: "0.8.10",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },

  // Migrations settings
  migrations: {
    deployer: {
      type: "truffle-deployer",
      riskFactor: 100
    }
  },

  // Plugins settings
  plugins: [
    "truffle-plugin-verify",
    "truffle-plugin-dashboard"
  ],

  // API settings
  api_keys: {
    etherscan: "YOUR_ETHERSCAN_API_KEY",
    infura: "YOUR_INFURA_PROJECT_ID"
  }
};
