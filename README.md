# Introduction

LACChain VC is a Proof-Of-Concept application that allow issuance and on-chain verification of Verifiable Credentials (VC)
following the [W3C data model](https://www.w3.org/TR/vc-data-model/), [EIP-712](https://eips.ethereum.org/EIPS/eip-712) and [EIP-1812](https://eips.ethereum.org/EIPS/eip-1812) for credential signatures and on-chain claims verification respectively.

# Webapp (DApp)

The Web Application is a Decentralized Application (DApp) that allows sign and issue the credentials.  

**Important:** The dependency chain for this implementation of onchain permisioning includes [web3js](https://github.com/ethereum/web3.js/) which is LGPL licensed.

## Deployment
Note: The build process for the Dapp is currently not supported on Windows.

### Initialise dependencies ###
Run `yarn install` to initialise project dependencies. This step is only required when setting up project
for the first time.

### Requirements

-  NodeJS v12.4.0

### Start the Development server ####

1. Run `yarn install` to install dependencies.
2. Configure environment variables or provide a .env file in the root of this project that configures the following variables
- `REACT_APP_CONTRACT`: The DNSRegistry contract address
3. Run `yarn run start` to start the web server that is serving our Dapp.
4. The default endpoint of application is http://localhost:3000
5. In your browser, connect Metamask to the LACChain network (the default endpoint is `http://35.184.61.29:4545/`)
6. All changes made to the smart contracts or to the DApp code will be automatically refreshed on the website.
   There is no need to restart the web server after making changes.

### Build the LACChain DNS DApp for Production ####

The deployment process covers 5 steps:
1. If this is the first time setting up the project, run `yarn install` to initialise project dependencies, otherwise skip this step.
2. Configure environment variables or provide a .env file in the root of this project that configures the following variables
- `REACT_APP_CONTRACT`: The DNSRegistry contract address
4. With these environment variables provided run `yarn run build` to create a production bundle
4. Use a webserver of your choice to host the contents of the folder as static files directing root requests to `index.html`

# Smart Contracts

This smart contracts will serve as a public on-chain point of validation for Verifiable Credentials.

The Credential Registry is an abstract contract that store the hash of the VC and the signatures of the signers.
The DiplomaClaimsVerifier is the public contract that interacts with the Credential Registry and has a set of methods to be used, such as:
 - ``register(address issuer, address _subject, bytes32 _credentialHash, uint256 _from, uint256 _exp, bytes calldata signature)`
   This method is invoked when the credential is issued
 - ``registerSignature(bytes32 _credentialHash, address issuer, bytes calldata _signature)``
   This method should bee invoked when the signer want to register their signature to a specific VC
 - ``verifyStudiesSigner(VerifiedStudies memory claim, bytes calldata _signature)``
   This method executes a set of validations to check the claims of a VC.

Summarizing, this smart contract allow to register the hash of the VC, the signature and verify if a VC has been issued and signed.

We are using [Openzeppelin Cli](https://docs.openzeppelin.com/cli/2.8/) to deploy the smart contracts.

This is the easiest way to get started for development with the smart contract:

First, you need to install openzeppelin cli dependencies.

```$ npm install --save-dev @openzeppelin/cli```

Second, you need to rename truffle-config.js.default to truffle-config.js and modify the file to set the node and private key to deploy the smart contract. Next execute the command to deploy.

```$ npx oz deploy```

If you need to upgrade the smart contract then execute the following command.

```npx oz upgrade```
