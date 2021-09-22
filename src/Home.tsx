import React, { useEffect, useState } from 'react';
import './App.css';
import {
  Center, Button, Image, Divider, Flex, Heading, Link, Modal, ModalBody,
  ModalContent, ModalOverlay, Text, useDisclosure, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useToast, Grid, Tooltip, Box, IconButton
} from "@chakra-ui/react"
import { theme } from './theme';
import { ArrowForwardIcon, EditIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { MdAccountBalanceWallet, MdBuild } from "react-icons/md"
import logo from './iconZerogoki.svg';
import iconMetamask from './iconMetamask.svg';
import iconWalletConnect from './iconWalletConnect.svg';
import bg from './assets/bg.jpg';
import boss from './assets/boss.png';
import lootlogo from './assets/lootlogo.png';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { chain_id_eth, defaultWalletProvider, getNewWalletConnectInstance, injected, walletconnect } from './connectors';
import { key_curr_wallect_index, key_duet_curr_user_account, kMetamaskConnection, useEagerConnect, useInactiveListener } from './hooks';
import { AbstractConnector } from '@web3-react/abstract-connector';
import Web3 from 'web3';
import {
  activityDescription, activityName, bag, bosses, checkTxConfirm, claim, claimSpoils, fight,
  fightBoss,
  mechanics, sleep, spawnBoss, spoilsInventory, spoilsUnclaimed, synthLootBag, tokenURI, weaponIdOfSynthLoot, xpForAdventurer, xpName
} from './contractTools';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react"

export var currChainId = chain_id_eth;
export var currUserAccount: any;
export var currUserAccountSigner: any;

export const chainName = new Map([
  [1, "ETH Mainnet"],
  [3, "ETH Ropsten"],
  [4, "ETH Rinkeby"],
  [5, "ETH Goerli"],
  [42, "ETH Kovan"],
  [56, "BSC Mainnet"],
  [65, "OKExChain Testnet"],
  [80001, "Polygon Testnet"],
  [97, "BSC Testnet"],
]);

function Home() {

  const [gameName, setGameName] = useState('');
  const [gameIntro, setGameIntro] = useState('');
  const [gameXPName, setGameXPName] = useState('');
  const [yourXP, setYourXP] = useState('');
  const [bossSpawned, setBossSpawned] = useState('');
  const [currentBossId, setCurrentBossId] = useState('');
  const [lastBossSpawnTime, setLastBossSpawnTime] = useState('');
  const [purityLevel, setPurityLevel] = useState('');
  const [weaknessLevel, setWeaknessLevel] = useState('');
  const [damageLevel, setDamageLevel] = useState('');
  const [stunLevel, setStunLevel] = useState('');
  const [bossHP, setBossHP] = useState('');
  const [spawnBlock, setSpawnBlock] = useState('');
  const [killBlock, setKillBlock] = useState('');
  const [inputBossId, setInputBossId] = useState(0);
  const [claimBossId, setClaimBossId] = useState(0);
  const [claimAmount, setClaimAmount] = useState(0);
  const [fang, setFang] = useState('');
  const [tail, setTail] = useState('');
  const [mantle, setMantle] = useState('');
  const [horn, setHorn] = useState('');
  const [claw, setClaw] = useState('');
  const [eye, setEye] = useState('');
  const [heart, setHeart] = useState('');
  const [unclaimed, setUnclaimed] = useState('');

  const [chest, setChest] = useState('');
  const [foot, setFoot] = useState('');
  const [hand, setHand] = useState('');
  const [head, setHead] = useState('');
  const [neck, setNeck] = useState('');
  const [ring, setRing] = useState('');
  const [waist, setWaist] = useState('');
  const [weapon, setWeapon] = useState('');
  const [weaponId, setWeaponId] = useState('');
  const [weaponAction, setWeaponAction] = useState('');
  const [fightAction, setFightAction] = useState('');

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const context = useWeb3React<Web3Provider>();
  const { connector, library, account, activate, deactivate, chainId } = context;

  // console.info('chainId = ', chainId);
  // console.info('currUserAccount: ', currUserAccount);
  // console.info('currUserAccountSigner: ', currUserAccountSigner);

  const W_1 = '3.5rem';
  const W_2 = '8rem';
  const W_3 = '5.5rem';

  if (chainId) {
    currChainId = chainId;
  } else {
    currChainId = 0;
  }

  // Get Mechanics
  useEffect(() => {
    if (currUserAccount !== undefined) {
      onMechanics();
      onSynthLootBag();
      getWeapon(currUserAccount);
      getXP();
    }
  }, [currUserAccount]);

  //
  function toastError(msg: string) {
    toast({
      title: msg,
      // description: msg,
      position: 'top-left',
      status: "error",
      duration: 9000,
      isClosable: true,
    })
  }

  function toastSuccess(msg: string) {
    toast({
      title: msg,
      // description: msg,
      position: 'top-left',
      status: "success",
      duration: 9000,
      isClosable: true,
    })
  }

  function toastInfo(msg: string) {
    toast({
      title: msg,
      position: 'top-left',
      status: "info",
      duration: 9000,
      isClosable: true,
    })
  }

  // AutoConnect
  const [balance, setBalance] = useState();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  /**
   * Automatically connect to wallet when open Zerogoki 
   * with built-in broswer of wallet app.
   */
  const checkBuiltInBrowser = async () => {

    // Be using built-in broswer
    if (isMobile && (window as Record<string, any>).ethereum) {
      const web3 = new Web3(Web3.givenProvider);
      const address = await web3.eth.requestAccounts();
      currUserAccount = address[0];

      if (library !== undefined && currUserAccount !== undefined && currUserAccount !== null) {
        currUserAccountSigner = library.getSigner(currUserAccount).connectUnchecked();
        localStorage.setItem(key_duet_curr_user_account, currUserAccount);
      }

      // Get balance of the address
      // const balance = await web3.eth.getBalance(currUserAccount);
      // myBalance = formatEther(balance);
      // setBalance(myBalance);

    } else { // On desktop or mobile independent browser

      if (library !== undefined && account !== undefined && account !== null) {
        currUserAccount = account;
        currUserAccountSigner = library.getSigner(account).connectUnchecked();
        localStorage.setItem(key_duet_curr_user_account, account);

      } else {
        currUserAccount = undefined;
        currUserAccountSigner = defaultWalletProvider;
        localStorage.removeItem(key_duet_curr_user_account);
      }
    }
  }


  checkBuiltInBrowser();
  // initContractObj(true);


  const [activatingConnector, setActivatingConnector] = React.useState();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined);
    }
  }, [connector, chainId, account, currUserAccount]);

  if (connector !== undefined) {
    if (connector === injected) {
      localStorage.setItem(kMetamaskConnection, "0");
    } else {
      localStorage.setItem(key_curr_wallect_index, "1");
    }
  }

  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager || !!activatingConnector);

  function onClickWallet(params: number, deactivate: Function, activate: Function,
    activatingConnector: AbstractConnector | undefined, setActivatingConnector: Function) {

    // console.info(params, activatingConnector);
    if (params === 0) { // MetaMask
      if (activatingConnector !== injected) {
        if (activatingConnector !== undefined) {
          // deactivate();
          // walletconnect.close();
        }

        activate(injected);
        setActivatingConnector(injected);
        localStorage.setItem(kMetamaskConnection, params.toString());
      }
    }

    if (params === 1) { // WalletConnect
      if (activatingConnector !== walletconnect) {
        if (activatingConnector !== undefined) {
          // deactivate();
        }

        getNewWalletConnectInstance();
        activate(walletconnect);
        setActivatingConnector(walletconnect);
        localStorage.setItem(key_curr_wallect_index, params.toString());
      }
    }
  }


  function ConnectWalletModal() {
    return (
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Flex
              onClick={() => { onClickWallet(0, deactivate, activate, activatingConnector, setActivatingConnector); onClose() }}
              align="center"
              p={{ base: 4, md: 4 }}
              cursor="pointer"
              _hover={{ bg: 'gray.100', borderRadius: "0.5rem" }}
            >

              <Image src={iconMetamask} w="3rem" />
              <Text color='black' fontSize="xl" fontWeight="bold" px={10}>MetaMask</Text>
            </Flex>

            <Divider color="#DAE3F0" my={4} />

            <Flex
              onClick={() => { onClickWallet(1, deactivate, activate, activatingConnector, setActivatingConnector); onClose() }}
              align="center"
              p={{ base: 4, md: 4 }}
              cursor="pointer"
              _hover={{ bg: 'gray.100', borderRadius: "0.5rem" }}
            >

              <Image src={iconWalletConnect} w="3rem" />
              <Text color='black' fontSize="xl" fontWeight="bold" px={10}>WalletConnect</Text>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  }

  function getAccountString() {
    let myAccount = currUserAccount.substring(0, 6) + ' ... ' +
      currUserAccount.substring(currUserAccount.length - 4);
    return myAccount;
  }

  function BeforeConnect() {
    return (
      <Button onClick={onOpen} px={5} leftIcon={<MdAccountBalanceWallet />}
        colorScheme="blue" variant="solid">
        Connect Wallet
      </Button>
    )
  }

  function AfterConnect() {
    return (
      <Flex align="center">
        <Text mr={5} color='yellow'>{chainName.get(currChainId)}</Text>
        <Button px={5} leftIcon={<MdAccountBalanceWallet />}
          colorScheme="blue" variant="solid">
          {getAccountString()}
        </Button>
      </Flex>
    )
  }

  function canRun() {
    if (currUserAccount === undefined) {
      toastError('Please connect to a wallet first.');
      return false;
    }

    if (chainId !== 42) { // 42 is kovan
      toastError('Please switch to Ethereum Kovan Testnet.');
      return false;
    }

    return true;
  }

  async function getData(content: string) {

    if (!canRun()) return;

    let res;
    switch (content) {
      case 'activityName':
        res = await activityName();
        setGameName(res);
        break;
      case 'activityDescription':
        res = await activityDescription();
        setGameIntro(res);
        break;
      case 'xpName':
        res = await xpName();
        setGameXPName(res);
        break;
      case 'xpForAdventurer':
        getXP();
        break;
      case 'mechanics':
        onMechanics();
        break;
      case 'bosses':
        res = await bosses(inputBossId);
        setBossHP(res.hp);
        setSpawnBlock(parseInt(res.spawnBlock._hex).toString());
        setKillBlock(parseInt(res.killBlock._hex).toString());
        break;
      case 'spoilsInventory':
        res = await spoilsInventory(currUserAccount);
        setFang(parseInt(res.fang._hex).toString());
        setTail(parseInt(res.tail._hex).toString());
        setMantle(parseInt(res.mantle._hex).toString());
        setHorn(parseInt(res.horn._hex).toString());
        setClaw(parseInt(res.claw._hex).toString());
        setEye(parseInt(res.eye._hex).toString());
        setHeart(parseInt(res.heart._hex).toString());
        break;
      case 'spoilsUnclaimed':
        res = await spoilsUnclaimed(currUserAccount, inputBossId);
        setUnclaimed(parseInt(res._hex).toString());
        break;
      default:
        break;
    }
  }

  async function getXP() {
    if (!canRun()) return;
    let res = await xpForAdventurer(currUserAccount);
    setYourXP(parseInt(res).toString());
  }

  async function getWeapon(address: string) {
    if (!canRun()) return;

    let preFA = 'Fight to plus the boss ';
    let res = await weaponIdOfSynthLoot(address);
    let weaponId = parseInt(res.res[0]._hex);
    // console.info('getWeaponId = ', weaponId)

    setWeaponId(weaponId.toString());

    if (weaponId >= 14) {
      // book
      setWeaponAction('purityLevel');
      setFightAction(preFA + 'purityLevel');
    } else if (weaponId >= 10) {
      // wand
      setWeaponAction('weaknessLevel');
      setFightAction(preFA + 'weaknessLevel');
    } else if (weaponId >= 5) {
      // blade
      setWeaponAction('damageLevel');
      setFightAction(preFA + 'damageLevel');
    } else {
      // bludgeon
      setWeaponAction('stunLevel');
      setFightAction(preFA + 'stunLevel');
    }
  }

  async function onMechanics() {
    if (!canRun()) return;

    let res = await mechanics();
    console.info('onMechanics = ', res)
    // if (res.result === 'error') {
    //   toastError('Fight failed.');
    // }

    setBossSpawned(res.bossSpawned.toString());
    setCurrentBossId(parseInt(res.currentBossId._hex).toString());
    setLastBossSpawnTime(parseInt(res.lastBossSpawnTime._hex).toString());
    setPurityLevel(parseInt(res.purityLevel._hex).toString());
    setWeaknessLevel(parseInt(res.weaknessLevel._hex).toString());
    setDamageLevel(parseInt(res.damageLevel._hex).toString());
    setStunLevel(parseInt(res.stunLevel._hex).toString());
  }

  async function onFight() {
    if (!canRun()) return;

    let res = await fight();
    // console.info('onFight = ', res)

    if (res.result === "ok") {
      toastInfo('Fight emitted. Please wait for confirmation.');
      if (await checkTxConfirm(res.hash)) {
        await sleep(15000);
        toastSuccess('Successfully Fighted! Checkout the boss status.');
        onMechanics();
        getXP();
      }
    } else {
      toastError('Fight failed.');
    }
  }

  async function onFightBoss() {
    if (!canRun()) return;

    let res = await fightBoss();
    console.info('onFightBoss = ', res)
    if (res.result === 'error') {
      toastError('Boss not spawned or fighting too soon.');
    }
  }

  async function onSpawnBoss() {
    if (!canRun()) return;

    let res = await spawnBoss();
    console.info('onSpawnBoss = ', res)
    if (res.result === 'error') {
      toastError('Conditions not met or already spawned or last boss too recent.');
    }
  }

  async function onClaimSpoils() {
    if (!canRun()) return;

    let res = await claimSpoils(claimBossId, claimAmount);
    console.info('onClaimSpoils = ', res)
    if (res.result === 'error') {
      toastError('Invalid boss id or boss not dead or no spoils to claim.');
    }
  }

  async function onSynthLootBag() {
    if (!canRun()) return;

    let res = await synthLootBag(currUserAccount);
    // console.info('onSynthLootBag = ', res)

    setChest(res.chest);
    setFoot(res.foot);
    setHand(res.hand);
    setHead(res.head);
    setNeck(res.neck);
    setRing(res.ring);
    setWaist(res.waist);
    setWeapon(res.weapon);
  }

  async function ogCickClaimBtn() {

    if (currUserAccount === undefined) { // Not connected to a wallet
      toastError('Please connect to a wallet first!');
      return;
    }

    if (currChainId !== chain_id_eth) {
      toastError('Please switch to Ethereum Mainnet!');
      return;
    }

    let res = await claim(inputBossId);
    console.info(res);
    if (res.result === "ok") {
      // mint success
      toastInfo('Claim emitted. Please wait for confirmation.');
      if (await checkTxConfirm(res.hash)) {
        toastSuccess('Successfully minted! Check on the OpenSea.');
      }
    } else {
      // mint fail
      toastError(res.msg);
    }
  }

  const showWeapon = (
    <Flex direction='column' w='20%' mr={10}>
      <Tooltip hasArrow label="Checkout your weapon" placement="top">
        <Button px={10} leftIcon={<MdBuild />} onClick={() => getWeapon(currUserAccount)}
          colorScheme="pink" variant="solid">
          Get Weapon
        </Button>
      </Tooltip>

      <Flex direction='column' fontSize='xl'>
        <Flex mt={3}>
          <Text>Weapon ID:</Text>
          <Text ml={3} color='yellow' fontWeight='bold'>{weaponId}</Text>
        </Flex>

        <Flex mt={3}>
          <Text>Weapon:</Text>
          <Text w='60%' ml={3} color='yellow' fontWeight='bold'>{weapon}</Text>
        </Flex>
      </Flex>

      <Flex mt={3} color='red' bg='yellow' px={3} borderRadius={5} >
        <Text>Your weapon only can plus the {weaponAction}.</Text>
      </Flex>
    </Flex>
  )

  const getMechanics = (
    <Flex direction='column' w='25%' mr={10}>
      <Tooltip hasArrow label="Checkout the boss status" placement="top">
        <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('mechanics')}
          colorScheme="pink" variant="solid">
          Get Mechanics
        </Button>
      </Tooltip>

      <Flex direction='column' fontSize='xl'>
        <Flex mt={3}>
          <Text w={W_2} align="right">bossSpawned:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{bossSpawned}</Text>
        </Flex>

        <Flex>
          <Text w={W_2} align="right">currentBossId:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{currentBossId}</Text>
        </Flex>

        <Flex>
          <Text w={W_2} align="right">SpawnTime:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{lastBossSpawnTime}</Text>
        </Flex>

        <Flex>
          <Text w={W_2} align="right">purityLevel:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{purityLevel}</Text>
        </Flex>

        <Flex>
          <Text w={W_2} align="right">weaknessLevel:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{weaknessLevel}</Text>
        </Flex>

        <Flex>
          <Text w={W_2} align="right">damageLevel:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{damageLevel}</Text>
        </Flex>

        <Flex>
          <Text w={W_2} align="right">stunLevel:</Text>
          <Text color='yellow' ml={3} fontWeight='bold'>{stunLevel}</Text>
        </Flex>
      </Flex>
    </Flex>
  )

  // ROOT
  return (
    <Center bgImage={bg} bgRepeat="no-repeat" bgSize='100%'>
      <Flex direction='column' w={['100%', '80%']} px={[2, 5]} py={[2, 5]}>
        <Flex direction={['column', 'row']} justify="space-between" align="center">
          <Text fontSize='6xl'>Loot Explorer</Text>
          <Text fontSize='xl' color='yellow'>Adventurer XP: {yourXP}</Text>
          <Flex>
            {currUserAccount === undefined ? <BeforeConnect /> : <AfterConnect />}

            <Popover>
              <PopoverTrigger>
                <Box as="button" ml={5}>
                  <Tooltip hasArrow label='Your Loot' placement="top">
                    <Image
                      borderRadius="full"
                      boxSize="45px"
                      src={lootlogo}
                    />
                  </Tooltip>
                </Box>
              </PopoverTrigger>
              <PopoverContent bg='black' color='white' fontSize='lg'>
                <PopoverBody>
                  <Flex direction='column'>
                    <Flex>
                      {/* <Text>chest:</Text> */}
                      <Text>{chest}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>foot:</Text> */}
                      <Text>{foot}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>hand:</Text> */}
                      <Text>{hand}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>head:</Text> */}
                      <Text>{head}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>neck:</Text> */}
                      <Text>{neck}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>ring:</Text> */}
                      <Text>{ring}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>waist:</Text> */}
                      <Text>{waist}</Text>
                    </Flex>

                    <Flex>
                      {/* <Text>weapon:</Text> */}
                      <Text>{weapon}</Text>
                    </Flex>
                  </Flex>
                </PopoverBody>
              </PopoverContent>
            </Popover>

            <ConnectWalletModal />
          </Flex>
        </Flex>

        <Flex mt={[1, 3]} fontSize='2xl' color='white' direction='column'>
          <Flex>
            <Text>Loot Explorer is a beta game which based on</Text>
            <Link color='blue' href="https://twitter.com/dhof/status/1437492613691674635" isExternal mx={2}>
              Hello Dungeon
            </Link>
            <Text>and</Text>
            <Link color='blue' href="https://www.lootproject.com/synthloot" isExternal mx={2}>
              Synthetic Loot.
            </Link>
          </Flex>
          <Text>Deployed on Ethereum Kovan Testnet.</Text>
          <Text fontWeight='bold' mt={3}>
            The Boss Spawned By Players, Fight By Players, Share Spoils By Players.
          </Text>
        </Flex>

        <Flex mt={10} mb={2} align="center">
          <Text color='yellow' fontSize='2xl'>World Boss</Text>
          <Text fontSize='xl' color='red' bg='yellow' px={3}
            borderRadius={5} ml={5}>Not Spawned - Need all of the four level more than 100
          </Text>
        </Flex>

        <Divider />

        <Flex justify='space-between' mt={10}>
          <Image src={boss} boxSize="350px" />
          {getMechanics}
          {showWeapon}

          <Flex direction='column' p={3}
            borderWidth='1px' borderColor='yellow' borderRadius={5}>

            <Grid templateColumns='repeat(1, 1fr)' gap={6} mt={[0, 5]}>
              <Tooltip hasArrow label={fightAction} placement="top">
                {/* <Tooltip hasArrow label="Fight to plus the " placement="top"> */}
                <Button px={10} leftIcon={<MdBuild />} onClick={onFight}
                  colorScheme="pink" variant="solid">
                  Fight
                </Button>
              </Tooltip>

              <Button px={10} leftIcon={<MdBuild />} onClick={onSpawnBoss}
                colorScheme="pink" variant="solid">
                Spawn Boss
              </Button>

              <Button px={10} leftIcon={<MdBuild />} onClick={onFightBoss}
                colorScheme="pink" variant="solid">
                Fight Boss
              </Button>

              <Popover>
                <PopoverTrigger>
                  <Button px={10} leftIcon={<MdBuild />} colorScheme="pink" variant="solid">
                    Claim Spoils
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <PopoverBody>
                    <NumberInput mt={2}>
                      <NumberInputField color='yellow' value={claimBossId} placeholder="Boss ID"
                        onChange={(e) => {
                          setClaimBossId(parseInt(e.target.value));
                        }} />
                    </NumberInput>

                    <NumberInput mt={2}>
                      <NumberInputField color='yellow' value={claimAmount} placeholder="Amount"
                        onChange={(e) => {
                          setClaimAmount(parseInt(e.target.value));
                        }} />
                    </NumberInput>

                    <Button colorScheme="blue" mt={3} onClick={onClaimSpoils}>Apply</Button>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            </Grid>
          </Flex>
        </Flex>

        <Text color='yellow' fontSize='2xl' mt='5rem'>Query Data</Text>
        <Divider />

        <Grid templateColumns={['repeat(2, 90vw)', 'repeat(4, 1fr)']} gap={6} mt={[0, 5]}>
          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('activityName')}
              colorScheme="pink" variant="solid">
              Activity Name
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Game Name:</Text>
              <Text color='yellow'>{gameName}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('activityDescription')}
              colorScheme="pink" variant="solid">
              Activity Description
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Game Intro:</Text>
              <Text color='yellow'>{gameIntro}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('xpName')}
              colorScheme="pink" variant="solid">
              XP Name
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Game XP name:</Text>
              <Text color='yellow'>{gameXPName}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('xpForAdventurer')}
              colorScheme="pink" variant="solid">
              XP For Adventurer
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Your XP:</Text>
              <Text color='yellow'>{yourXP}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={onSynthLootBag}
              colorScheme="pink" variant="solid">
              Synthetic Loot
            </Button>

            <Flex mt={3}>
              <Text w={W_1} align="right">chest:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{chest}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">foot:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{foot}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">hand:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{hand}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">head:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{head}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">neck:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{neck}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">ring:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{ring}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">waist:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{waist}</Text>
            </Flex>

            <Flex>
              <Text w={W_1} align="right">weapon:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{weapon}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('bosses')}
              colorScheme="pink" variant="solid">
              Checkout Bosses
            </Button>

            <Flex direction='column' mt={3}>
              <NumberInput>
                <NumberInputField color='yellow' value={inputBossId} placeholder="Enter Boss ID"
                  onChange={(e) => {
                    setInputBossId(parseInt(e.target.value));
                  }} />
              </NumberInput>

              <Flex mt={2}>
                <Text w={W_3} align="right">Boss HP:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{bossHP}</Text>
              </Flex>

              <Flex>
                <Text w={W_3} align="right">spawnBlock:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{spawnBlock}</Text>
              </Flex>

              <Flex>
                <Text w={W_3} align="right">killBlock:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{killBlock}</Text>
              </Flex>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('spoilsInventory')}
              colorScheme="pink" variant="solid">
              Spoils Inventory
            </Button>

            <Flex direction='column' mt={3}>
              <Flex>
                <Text w={W_1} align="right">fang:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{fang}</Text>
              </Flex>

              <Flex>
                <Text w={W_1} align="right">tail:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{tail}</Text>
              </Flex>

              <Flex>
                <Text w={W_1} align="right">mantle:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{mantle}</Text>
              </Flex>

              <Flex>
                <Text w={W_1} align="right">horn:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{horn}</Text>
              </Flex>

              <Flex>
                <Text w={W_1} align="right">claw:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{claw}</Text>
              </Flex>

              <Flex>
                <Text w={W_1} align="right">eye:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{eye}</Text>
              </Flex>

              <Flex>
                <Text w={W_1} align="right">heart:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{heart}</Text>
              </Flex>
            </Flex>
          </Flex>


          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('spoilsUnclaimed')}
              colorScheme="pink" variant="solid">
              Spoils Unclaimed
            </Button>

            <NumberInput mt={3}>
              <NumberInputField color='yellow' value={inputBossId} placeholder="Enter Boss ID"
                onChange={(e) => {
                  setInputBossId(parseInt(e.target.value));
                }} />
            </NumberInput>

            <Flex mt={2}>
              <Text>Unclaimed: </Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{unclaimed}</Text>
            </Flex>
          </Flex>
        </Grid>

        <Text color='yellow' fontSize='2xl' mt='5rem'>Links</Text>
        <Divider />

        <Flex mt={2} mb={2} fontSize='xl'>
          Origin of the Loot:
        </Flex>

        <Flex fontSize='xl'>
          <Link mr={[2, 10]} href="https://opensea.io/collection/lootproject" isExternal>
            OpenSea <ExternalLinkIcon mx="2px" mb="3px" />
          </Link>
          <Link mr={[2, 10]} href="https://discord.gg/NXEntTSHgy" isExternal>
            Discord <ExternalLinkIcon mx="2px" mb="3px" />
          </Link>
          <Link mr={[0, 10]} href="https://twitter.com/lootproject" isExternal>
            @lootproject <ExternalLinkIcon mx="2px" mb="3px" />
          </Link>
        </Flex>

        <Center>
          <Flex mt='3rem' mb={6} fontSize='xl' color='white'>
            <Text>This website is a beta game.</Text>
            {/* <Link color='blue' href="https://github.com/iamgamelover/LootExplorer" isExternal mx={2}>
              open-source.
            </Link> */}
          </Flex>
        </Center>
      </Flex>
    </Center>
  );
}

export default Home;
