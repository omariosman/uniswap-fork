
const Web3 = require('web3');
const RouterArtifacts = require('./build/contracts/UniswapV2Router02.json');
const Token1Artifacts = require('./build/contracts/Token1.json');
const Token2Artifacts = require('./build/contracts/Token2.json');
const FactoryArtifacts = require('./build/contracts/UniswapV2Factory.json');
//const PairArtifacts = require('./build/contracts/UniswapV2Pair.json');


const contract = require('truffle-contract');
const RouterContract = contract(RouterArtifacts);
const Token1 = contract(Token1Artifacts);
const Token2 = contract(Token2Artifacts);
const Factory = contract(FactoryArtifacts);
//const Pair = contract(PairArtifacts);

// Initialize web3 instance
//const providerUrl = 'http://localhost:8545'; // Replace this with your own provider URL if needed
//const web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
const providerUrl = 'ws://localhost:8545'; // Replace this with your own provider URL if needed
const web3 = new Web3(new Web3.providers.WebsocketProvider(providerUrl));


async function addLiquidity(router, tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline) {
    const result = await router.methods.addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin,
      to,
      deadline
    ).send({ from: to });
  
    return result;
  }
  


async function approveRouter(tokenContract, routerAddress, amount, owner) {
  await tokenContract.approve(routerAddress, amount, { from: owner });
}

async function swapTokens(router, tokenIn, tokenOut, amountIn, recipient, deadline) {
  const amountsOut = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
  const amountOutMin = amountsOut[1]; // We can also add slippage tolerance here if needed

  await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenIn, tokenOut],
    recipient,
    deadline,
    { from: recipient }
  );
}

(async () => {
    try {
        const addresses = await web3.eth.getAccounts();


        RouterContract.setProvider(web3.currentProvider);
        RouterContract.defaults({ gasLimit: 6721975, from: addresses[0] });
        
        Token1.setProvider(web3.currentProvider);
        Token1.defaults({ gasLimit: 6721975, from: addresses[0] });
        
        Token2.setProvider(web3.currentProvider);
        Token2.defaults({ gasLimit: 6721975, from: addresses[0] });
        
        Factory.setProvider(web3.currentProvider);
        Factory.defaults({ gasLimit: 6721975, from: addresses[0] });
        
        //Pair.setProvider(web3.currentProvider);
        //Pair.defaults({ gasLimit: 6721975, from: addresses[0] });

        web3.eth.subscribe('logs', {}, (error, result) => {
            if (!error) {
              console.log('Event:', result);
            } else {
              console.log('Event Error:', error);
            }
          });

        const routerContract = await RouterContract.deployed();
            
        // Interact with the deployed factory contract
        const factoryContract = await Factory.at('0xFA790149e65706F879064d0cff496828651af226');

        // Set the amount of token1 you want to swap
        const amountIn = web3.utils.toWei('1', 'ether'); // 1 token1, for example
    
        // Interact with the deployed Token1 contract
        const token1Contract = await Token1.at('0x952494B56AFdc74898b1ccd4a55E53D208cB53d0');
    
        // Mint tokens to the address if needed (only if the mint function is available in the Token1 contract)
        await token1Contract.mint(addresses[0], amountIn, { from: addresses[0] });
    

        // Perform the token swap
        const token2Contract = await Token2.at('0x4BED553b1Ea0Bbe296Ff9071f8CeC8b09b001c87');
        
        // Approve the router to spend token1 on behalf of the sender
        await approveRouter(token1Contract, routerContract.address, amountIn, addresses[0]);
        await approveRouter(token2Contract, routerContract.address, amountIn, addresses[0]);


        //await factoryContract.createPair(token1Contract.address, token2Contract.address, { from: addresses[0] });

        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from the current Unix time
        
        const allowance = await token1Contract.allowance(addresses[0], routerContract.address);
        console.log("Allowance:", allowance);

        // let pairAddress = await factoryContract.getPair(token1Contract.address, token2Contract.address);
        // let pairContract = await Pair.at(pairAddress);
        // let reserves = await pairContract.getReserves();
        // console.log("Reserves:", reserves);
        


        const token1Amount = web3.utils.toWei('100', 'ether'); // 100 token1
        const token2Amount = web3.utils.toWei('200', 'ether'); // 200 token2
        
        const minToken1Amount = web3.utils.toWei('99', 'ether'); // Minimum acceptable token1 amount
        const minToken2Amount = web3.utils.toWei('199', 'ether'); // Minimum acceptable token2 amount
        
        //await addLiquidity(routerContract, token1Contract.address, token2Contract.address, token1Amount, token2Amount, minToken1Amount, minToken2Amount, addresses[0], deadline);
        
        //  pairAddress = await factoryContract.getPair(token1Contract.address, token2Contract.address);
        //  pairContract = await Pair.at(pairAddress);
        //  reserves = await pairContract.getReserves();
        // console.log("Reserves:", reserves);
        

        //await swapTokens(routerContract, token1Contract.address, token2Contract.address, amountIn, addresses[0], deadline);
    
        console.log('Token swap executed successfully');
   
   } catch (error) {
      console.log('Error: ', error);
    }
  })();
  
