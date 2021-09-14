import { Contract, ethers } from 'ethers';
import Web3 from 'web3';
import lootABI from './abis/loot.json'
import synthLootABI from './abis/synthLoot.json'
import HelloDungeonABI from './abis/HelloDungeon.json'
import { default_rpc_url } from './connectors';
import { currUserAccount, currUserAccountSigner } from './Home';

const lootAddress = "0xFF9C1b15B16263C61d017ee9F65C50e4AE0113D7";
const moreLootAddress = "0x1dfe7ca09e99d10835bf73044a23b73fc20623df";
const synthLootAddress = "0x869Ad3Dfb0F9ACB9094BA85228008981BE6DBddE";
const synthLootAddressOnPolygon = "0x1F654D1105C27e631Dd5aF20B76100750c755741";
const helloDungeonAddressOnPolygon = "0x167D0f495c59ec75Af0190516dE3b60720CAc956";

const web3: Web3 = new Web3(new Web3.providers.HttpProvider(default_rpc_url));

export async function xpName(): Promise<any> {
  const contract = new ethers.Contract(helloDungeonAddressOnPolygon, HelloDungeonABI, currUserAccountSigner);
  let res = await contract.fight();
  // let res = await contract.xpName();
  if (res) {
    console.info('xpName == ', res)
    return res;
  }
}

export async function bag(lootId: number): Promise<any> {
  const ogloot = new ethers.Contract(lootAddress, lootABI, currUserAccountSigner);
  const moreLoot = new ethers.Contract(moreLootAddress, lootABI, currUserAccountSigner);

  if (lootId > 0) {
    let loot = (lootId < 8001) ? ogloot : moreLoot;
    let type = (lootId < 8001) ? "Loot" : "More Loot";

    const [chest, foot, hand, head, neck, ring, waist, weapon] =
      await Promise.all([
        loot.getChest(lootId),
        loot.getFoot(lootId),
        loot.getHand(lootId),
        loot.getHead(lootId),
        loot.getNeck(lootId),
        loot.getRing(lootId),
        loot.getWaist(lootId),
        loot.getWeapon(lootId),
      ]);

    let bag = {
      id: lootId,
      type: type,
      chest: chest,
      foot: foot,
      hand: hand,
      head: head,
      neck: neck,
      ring: ring,
      waist: waist,
      weapon: weapon,
    }

    return bag;
  }

  return {};
}

export async function synthLootBag(walletAddress: string): Promise<any> {
  const loot = new ethers.Contract(synthLootAddressOnPolygon, synthLootABI, currUserAccountSigner);
  // const loot = new ethers.Contract(synthLootAddress, synthLootABI, currUserAccountSigner);

  if (walletAddress !== undefined || walletAddress !== '') {
    const [chest, foot, hand, head, neck, ring, waist, weapon] =
      await Promise.all([
        loot.getChest(walletAddress),
        loot.getFoot(walletAddress),
        loot.getHand(walletAddress),
        loot.getHead(walletAddress),
        loot.getNeck(walletAddress),
        loot.getRing(walletAddress),
        loot.getWaist(walletAddress),
        loot.getWeapon(walletAddress),
      ]);

    let bag = {
      id: walletAddress,
      chest: chest,
      foot: foot,
      hand: hand,
      head: head,
      neck: neck,
      ring: ring,
      waist: waist,
      weapon: weapon,
    }

    return bag;
  }

  return {};
}

export async function claim(tokenId: number): Promise<any> {
  if (currUserAccount) {
    let contract = new Contract(moreLootAddress, lootABI, currUserAccountSigner);
    try {
      let res = await contract.claim(tokenId);
      if (res) {
        console.info('claim == ', res)
        return { "result": "ok", "hash": res.hash };
      }
    } catch (error: any) {
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

export async function tokenURI(tokenId: number): Promise<any> {
  if (currUserAccount) {
    let contract = new Contract(lootAddress, lootABI, currUserAccountSigner);
    try {
      let res = await contract.tokenURI(tokenId);
      if (res) {
        console.info('tokenURI == ', res)
        return { "result": "ok", "hash": res.hash };
      }
    } catch (error: any) {
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
export async function checkTxConfirm(txHash: string): Promise<boolean> {
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