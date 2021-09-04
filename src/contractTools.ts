import { Contract, ethers } from 'ethers';
import WoWLootAbi from './abis/wowloot.json'
import { currUserAccount, currUserAccountSigner } from './Home';

// TODO change to mainnet
const WowlootAddress = "0xbec1dc145c18d69451aa56346a0add3886f88286";

export async function claim(tokenId: number): Promise<any> {
    if (currUserAccount) {
        let contract = new Contract(WowlootAddress, WoWLootAbi, currUserAccountSigner);
        try {
            let res = await contract.claim(tokenId);
            if (res) {
                return { "result": "ok", "hash": res.hash };
            }
        } catch (error: any) {

            console.info(error);
            let msg = error.message as string
            if (error.error) {
                msg = error.error.message as string
            }

            let prefix = "MetaMask Tx Signature: "
            if (msg.startsWith("MetaMask Tx Signature: ") === false) {
                prefix = "execution reverted: "
            }

            return { "result": "error", "msg": msg.substr(prefix.length) };
        }
    }
    return { "result": "error", "msg": "Please connect to a wallet first!" };
}