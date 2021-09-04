import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import { ethers } from "ethers";
import { infuraKey2, infuraKey1 } from "./keyinfo";

const POLLING_INTERVAL = 12000;
export const RPC_URLS = {
  1: "https://mainnet.infura.io/v3/" + infuraKey2,
  2: "https://ropsten.infura.io/v3/" + infuraKey2,
  4: "https://rinkeby.infura.io/v3/" + infuraKey2,
  42: "https://kovan.infura.io/v3/" + infuraKey2,
  56: "https://bsc-dataseed2.binance.org/",              //bsc main
  65: "https://exchaintestrpc.okex.org",                //okchain test
  66: "https://exchainrpc.okex.org",                    //okchain main
  97: "https://data-seed-prebsc-1-s2.binance.org:8545", //bsc test
  128: "https://http-mainnet-node.huobichain.com",      //heco test
  137: "https://rpc-mainnet.maticvigil.com/",           //polygon main  https://docs.matic.network/docs/develop/metamask/config-polygon-on-metamask/
  80001: "https://rpc-mumbai.maticvigil.com/",          //polygon test
  256: "https://http-testnet.hecochain.com",
};


export function getRpcUrl(index:number){
  switch (index) {
    case 1:
    case 2:
    case 4:
    case 42:
    case 56:
    case 65:
    case 66:
    case 97:
    case 128:
    case 137:
    case 80001:
    case 256:
      return RPC_URLS[index]
  
    default:
      break;
  }
  return RPC_URLS[chain_id_bsc]
}

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 65, 66, 137, 80001, 97, 256]
});

export var walletconnect = getNewWalletConnectInstance();

export function getNewWalletConnectInstance(): WalletConnectConnector {
  walletconnect = new WalletConnectConnector({
    rpc: { 1: RPC_URLS[1] },
    bridge: "https://bridge.walletconnect.org",
    qrcode: true,
    pollingInterval: POLLING_INTERVAL
  });
  return walletconnect;
}

export const chain_id_eth = 4;
export const chain_id_okChain = 65;
export const chain_id_bsc = 97;
export const chain_id_polygon = 80001;

export const default_rpc_url = RPC_URLS[chain_id_eth]
//export const rpc_url_web3 = "https://mainnet.infura.io/v3/" + infuraKey1;
export const rpc_url_web3 = default_rpc_url;
export const defaultWalletProvider = new ethers.providers.JsonRpcProvider(default_rpc_url);