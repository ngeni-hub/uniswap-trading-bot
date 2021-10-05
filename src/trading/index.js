import { botDatabase } from './database';
import { UniswapEthToToken, UniswapTokenToEth } from './uniswap';

const startTheBot = async () => {

  const trades = botDatabase.get('trades')
    .value();

  botDatabase.set('notifications', []).write();

  if (trades.length === 0) return;

  for (let i = 0; i < trades.length; i++) {
    const tokenAddress = trades[i].tokenAddress;
    const tokenSymbol = trades[i].tokenSymbol;
    const tokenToBuy = trades[i].toBuy;
    const tokenToSell = trades[i].toSell;
    const buyLimit = trades[i].buyLimit;
    const sellLimit = trades[i].sellLimit;

    console.log("*********************CONFIGURATION***********************")
    console.log("Token: ", tokenSymbol);
    console.log("To sell " + tokenToSell + " " + tokenSymbol + " on " + sellLimit + " sell limit");
    console.log("To buy " + tokenToBuy + " " + tokenSymbol + " on " + buyLimit + " buy limit");

    try {
      const res = await fetch('https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2', {
        method: 'POST',
        body: JSON.stringify({ query: `{ tokenDayDatas( first: 1, orderBy: date, orderDirection: desc, where: { token: "${tokenAddress}" }) { priceUSD } }` }),
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => res.json());

      let tokenData = res.data.tokenDayDatas;

      if (tokenData.length === 0) break;

      let price = tokenData[0].priceUSD;

      console.log("=========================================================");
      console.log(tokenSymbol + " Price in USD:", price);
      console.log("=========================================================");

      if (buyLimit && buyLimit > 0 && price < buyLimit) {
        console.log("Start Token Buying");
        await UniswapEthToToken(tokenAddress, tokenSymbol, buyLimit);
      } else if (sellLimit && sellLimit > 0 && price > sellLimit) {
        console.log("Start Token Selling");
        await UniswapTokenToEth(tokenAddress, tokenSymbol, sellLimit);
      }

    } catch (e) {
      console.log(e);
      continue;
    }
  }

}

export { startTheBot };

