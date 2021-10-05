import { ChainId, Fetcher, Percent, Route, Token, TokenAmount, Trade, TradeType, WETH } from '@uniswap/sdk';
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import tokenABI from './abi/tokenAbi.json';
import uniSwapABI from './abi/uniswapAbi.json';
import { botDatabase } from './database';
import { provider, wallet } from './wallet';

const uniSwapContractAddress = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';

const uniSwapContract = new ethers.Contract(uniSwapContractAddress, uniSwapABI, wallet);

const UniswapEthToToken = async (tokenAddress, tokenSymbol, amount) => {

  const amountIn = parseEther(amount.toString());

  const to = wallet.address;

  const TOKEN = new Token(ChainId.MAINNET, tokenAddress, 18);

  const pair = await Fetcher.fetchPairData(TOKEN, WETH[TOKEN.chainId])

  const route = new Route([pair], WETH[TOKEN.chainId])

  const trade = new Trade(route, new TokenAmount(TOKEN, amountIn), TradeType.EXACT_OUTPUT)

  const slippageTolerance = new Percent('50', '10000')

  const amountOutMin = String(trade.minimumAmountOut(slippageTolerance).raw)

  const path = [WETH[TOKEN.chainId].address, TOKEN.address]
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20
  const value = String(trade.inputAmount.raw)

  const bought = await uniSwapContract.swapETHForExactTokens(amountOutMin, path, to, deadline, {
    gasLimit: 5000000,
    value
  });

  await provider.once(bought.hash, (receipt) => {
    console.log(`${tokenSymbol} bought at ${amount}.`);
    console.log(receipt);
    if (receipt.status === 1) {

      botDatabase.get('notifications')
        .push({ id: bought.hash, sent: false, message: `${tokenSymbol} bought at ${amount}.` })
        .write();

      botDatabase.get('trades')
        .find({ tokenAddress: tokenAddress })
        .assign({ buyLimit: 0 })
        .write();

      console.log("Buy Limit reset.")
    }
  })
}

const UniswapTokenToEth = async (tokenAddress, tokenSymbol, amount) => {

  const amountIn = parseEther((amount).toString())

  const to = wallet.address;

  const tokenContract = new ethers.Contract(tokenAddress, tokenABI, wallet);

  const allowance = await tokenContract.allowance(to, uniSwapContractAddress);
  if (allowance <= amountIn) {

    const approved = await tokenContract.approve(uniSwapContractAddress, "1000000000000000000000000");

    await provider.once(approved.hash, () => {
      console.log('Approved...');
    });
  }

  const TOKEN = new Token(ChainId.MAINNET, tokenAddress, 18)

  const pair = await Fetcher.fetchPairData(TOKEN, WETH[TOKEN.chainId])

  const route = new Route([pair], TOKEN, WETH[TOKEN.chainId])

  const trade = new Trade(route, new TokenAmount(TOKEN, amountIn), TradeType.EXACT_INPUT)

  const slippageTolerance = new Percent('50', '10000')

  const amountOutMin = String(trade.minimumAmountOut(slippageTolerance).raw)

  const path = [TOKEN.address, WETH[TOKEN.chainId].address]

  const deadline = Math.floor(Date.now() / 1000) + 60 * 20
  const value = String(trade.inputAmount.raw)

  const sold = await uniSwapContract.swapExactTokensForETH(value, amountOutMin, path, to, deadline);

  await provider.once(sold.hash, (receipt) => {
    console.log(`${tokenSymbol} sold at ${amount}.`);
    console.log(receipt);
    if (receipt.status === 1) {

      botDatabase.get('notifications')
        .push({ id: sold.hash, sent: false, message: `${tokenSymbol} sold at ${amount}.` })
        .write();

      botDatabase.get('trades')
        .find({ tokenAddress: tokenAddress })
        .assign({ sellLimit: 0 })
        .write();

      console.log("Sell Limit reset.")
    }
  })

}

export { UniswapEthToToken, UniswapTokenToEth };

