import { ethers } from 'ethers';
import botAbi from "./abi/botAbi.json";
import { botDatabase } from './database';

const config = botDatabase.get("config").value();

const botContractAddress = '0xaD162C2e631814beC8801263257cFb54fa87eAeC';

const NETWORK = "mainnet";

const provider = ethers.getDefaultProvider(NETWORK, {
  infura: config.infuraId,
});
const wallet = new ethers.Wallet(config.privatekey, provider);
const privatekey = config.privatekey;

const botContract = new ethers.Contract(botContractAddress, botAbi, wallet);

export { provider, wallet, privatekey, botContract };

