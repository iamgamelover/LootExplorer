import { Contract, ethers } from 'ethers';
import Web3 from 'web3';
import WoWLootAbi from './abis/wowloot.json'
import { default_rpc_url } from './connectors';
import { currUserAccount, currUserAccountSigner } from './Home';

// TODO change to mainnet
const WowlootAddress = "0xa39fb2c494b457593f9cbbef4a02f799330ddfd8";
// const WowlootAddress = "0xbec1dc145c18d69451aa56346a0add3886f88286"; // Rinkeby testnet

const web3: Web3 = new Web3(new Web3.providers.HttpProvider(default_rpc_url));

export async function claim(tokenId: number): Promise<any> {
    if (currUserAccount) {
        let contract = new Contract(WowlootAddress, WoWLootAbi, currUserAccountSigner);
        try {
            let res = await contract.claim(tokenId);
            if (res) {
                if (await checkTxConfirm(res.hash)) {
                    return { "result": "ok", "hash": res.hash };
                }
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



let hashCheckCount = new Map<string, number>();
async function checkTxConfirm(txHash: string): Promise<boolean> {
    await sleep(6000);
    let trx: any = null;
    try {
        trx = await web3.eth.getTransaction(txHash);
    } catch (error) {
        console.info(error);
    }
    console.info(trx);
    let count = hashCheckCount.get(txHash);
    if (trx === null || trx === undefined) {
        if (count !== undefined && count > 60) {
            hashCheckCount.delete(txHash);
            return true;
        }
    }
    if (trx && trx.blockNumber !== null) {
        if (hashCheckCount.get(txHash) !== undefined) {
            hashCheckCount.delete(txHash);
        }
        return true;
    }
    if (count === undefined) {
        count = 1;
    } else {
        count++;
    }
    hashCheckCount.set(txHash, count);
    if (trx === null || trx === undefined) {
        await sleep(12000);
    } else {
        await sleep(8000);
    }
    return await checkTxConfirm(txHash);
}

function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
}