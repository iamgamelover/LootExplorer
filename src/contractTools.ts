import { Contract, ethers } from 'ethers';
import WoWLootAbi from './abis/wowloot.json'
import { chain_id_eth, RPC_URLS } from './connectors';
import { currUserAccount, currUserAccountSigner } from './Home';

const WowlootAddress = "0xbec1dc145c18d69451aa56346a0add3886f88286";

export async function claim(tokenId:number):Promise<any>{
    if(currUserAccount){
        let contract = new Contract(WowlootAddress,WoWLootAbi,currUserAccountSigner);
        try {
            let res = await contract.claim(tokenId);
            if(res){
                return {"result":"ok","hash":res.hash};
            }
        } catch (error:any) {
            return {"result":"error","msg":"error tokenId"};
        }
    }
    return "";
}