const Web3 = require('web3');
const artifacts = require('./build/contracts/UniswapV2Factory.json');
const contract = require('truffle-contract');
const MyContract = contract(artifacts);

// Initialize web3 instance
const providerUrl = 'http://localhost:8545'; // Replace this with your own provider URL if needed
const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));

MyContract.setProvider(web3.currentProvider);

(async () => {
    const factoryContract = await MyContract.deployed();

    let totalPairs = await factoryContract.allPairsLength();
    console.log("totalPairs: ", totalPairs);

    let allPairs = [];
    
    for (let i = 0; i < totalPairs; i++) {
      let pairAddress = await factoryContract.allPairs(i);
      allPairs.push(pairAddress);
    }
    
    console.log(allPairs);
    
})();

