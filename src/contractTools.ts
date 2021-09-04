import { Contract, ethers } from 'ethers';
import WoWLootAbi from './abis/wowloot.json'
import { chain_id_eth, RPC_URLS } from './connectors';
import { currUserAccountSigner } from './Home';

const WowlootAddress = "0xbec1dc145c18d69451aa56346a0add3886f88286";

export function claim(tokenId:string){

    
   let contract = new Contract(WowlootAddress,WoWLootAbi,new ethers.providers.JsonRpcProvider(RPC_URLS[chain_id_eth]));
   if(currUserAccountSigner){
       contract = new Contract(WowlootAddress,WoWLootAbi,currUserAccountSigner);
   }

}