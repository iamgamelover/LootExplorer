import React, { useState } from 'react';
import './App.css';
import {
  Center, Button, Image, Divider, Flex, Heading, Link, Modal, ModalBody,
  ModalContent, ModalOverlay, Text, useDisclosure, NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper, useToast, Grid
} from "@chakra-ui/react"
import { theme } from './theme';
import { ArrowForwardIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { MdAccountBalanceWallet, MdBuild } from "react-icons/md"
import logo from './iconZerogoki.svg';
import iconMetamask from './iconMetamask.svg';
import iconWalletConnect from './iconWalletConnect.svg';
import bg from './bg.jpg';
import wow from './wow.png';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { chain_id_eth, defaultWalletProvider, getNewWalletConnectInstance, injected, walletconnect } from './connectors';
import { key_curr_wallect_index, key_duet_curr_user_account, kMetamaskConnection, useEagerConnect, useInactiveListener } from './hooks';
import { AbstractConnector } from '@web3-react/abstract-connector';
import Web3 from 'web3';
import {
  activityDescription, activityName, bag, bosses, checkTxConfirm, claim, fight,
  mechanics, synthLootBag, tokenURI, xpForAdventurer, xpName
} from './contractTools';

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
  // console.info('currUserAccount: ', currUserAccount);
  // console.info('currUserAccountSigner: ', currUserAccountSigner);

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

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const context = useWeb3React<Web3Provider>();
  const { connector, library, account, activate, deactivate, chainId } = context;

  if (chainId) {
    currChainId = chainId;
  } else {
    currChainId = 0;
  }

  //
  function toastError(msg: string) {
    toast({
      title: msg,
      // description: msg,
      status: "error",
      duration: 9000,
      isClosable: true,
    })
  }

  function toastSuccess(msg: string) {
    toast({
      title: msg,
      // description: msg,
      status: "success",
      duration: 9000,
      isClosable: true,
    })
  }

  function toastInfo(msg: string) {
    toast({
      title: msg,
      status: "info",
      duration: 9000,
      position: 'top',
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

  React.useEffect(() => {
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


  let [inputBossId, setInputBossId] = useState(0)

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
          Connected to {getAccountString()}
        </Button>
      </Flex>
    )
  }

  async function clickClaimBtn() {
    // 👁️ Bag #1000 (an OG Loot)
    // var mybag = await bag(1000);
    // var mybag = await tokenURI(1000);
    // var mybag = await claim(inputBagId);
    // var mybag = await fight();

    // var mybag = await synthLootBag('0xdE87541D9D34E8643a5AeeAA6C68C2De23881EF0');
    var mybag = await xpForAdventurer('0x3Ed007531449555aB2eDc695E25f1c1892Ed81d1');

    console.log(mybag);
  }

  async function getData(content: string) {
    let res;
    switch (content) {
      case 'activityName':
        res = await activityName();
        // toastInfo(res);
        setGameName(res);
        break;
      case 'activityDescription':
        res = await activityDescription();
        // toastInfo(res);
        setGameIntro(res);
        break;
      case 'xpName':
        res = await xpName();
        // toastInfo(res);
        setGameXPName(res);
        break;
      case 'xpForAdventurer':
        res = await xpForAdventurer(currUserAccount);
        // toastInfo(res);
        setYourXP(res);
        break;
      case 'mechanics':
        res = await mechanics();
        setBossSpawned(res.bossSpawned.toString());
        setCurrentBossId(res.currentBossId._hex);
        setLastBossSpawnTime(res.lastBossSpawnTime._hex);
        setPurityLevel(res.purityLevel._hex);
        setWeaknessLevel(res.weaknessLevel._hex);
        setDamageLevel(res.damageLevel._hex);
        setStunLevel(res.stunLevel._hex);
        break;
      case 'bosses':
        res = await bosses(inputBossId);
        setBossHP(res.hp);
        setSpawnBlock(res.spawnBlock._hex);
        setKillBlock(res.killBlock._hex);
        break;
      default:
        break;
    }
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

  // ROOT
  return (
    // <Center bgImage={bg}>
    <Center px={[2, 0]}>
      <Flex direction='column' w={['100%', '80%']} px={[2, 5]} py={[2, 5]}>
        <Flex direction={['column', 'row']} justify="space-between" align="center">
          <Text fontSize='6xl' mb={[2, 0]}>Loot Explorer</Text>
          <Flex>
            {currUserAccount === undefined ? <BeforeConnect /> : <AfterConnect />}
            <ConnectWalletModal />
          </Flex>
        </Flex>

        {/* <Flex mt={[8, 1]} mb={5} fontSize='2xl'>
          By @Duet
        </Flex> */}

        <Flex w={['100%', '70%']} mt={[10, 3]} fontSize='xl' color='white'>
          Loot Explorer is a beta game with HelloDungeon and Synthetic Loot contracts on Ethereum Kovan Testnet.
        </Flex>

        <Text color='yellow' fontSize='2xl' mt={5}>Query Data</Text>
        <Divider />

        <Grid templateColumns={['repeat(2, 90vw)', 'repeat(4, 1fr)']} gap={6} mt={[0, 5]}>
          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('activityName')}
              colorScheme="pink" variant="solid">
              activityName
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Game Name:</Text>
              <Text color='yellow'>{gameName}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('activityDescription')}
              colorScheme="pink" variant="solid">
              activityDescription
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Game Intro:</Text>
              <Text color='yellow'>{gameIntro}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('xpName')}
              colorScheme="pink" variant="solid">
              xpName
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Game XP name:</Text>
              <Text color='yellow'>{gameXPName}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('xpForAdventurer')}
              colorScheme="pink" variant="solid">
              xpForAdventurer
            </Button>

            <Flex direction='column' mt={3}>
              <Text>Your XP:</Text>
              <Text color='yellow'>{yourXP}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('mechanics')}
              colorScheme="pink" variant="solid">
              Get Mechanics
            </Button>

            <Flex mt={3}>
              <Text>bossSpawned:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{bossSpawned}</Text>
            </Flex>

            <Flex>
              <Text>currentBossId:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{currentBossId}</Text>
            </Flex>

            <Flex>
              <Text>lastBossSpawnTime:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{lastBossSpawnTime}</Text>
            </Flex>

            <Flex>
              <Text>purityLevel:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{purityLevel}</Text>
            </Flex>

            <Flex>
              <Text>weaknessLevel:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{weaknessLevel}</Text>
            </Flex>

            <Flex>
              <Text>damageLevel:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{damageLevel}</Text>
            </Flex>

            <Flex>
              <Text>stunLevel:</Text>
              <Text color='yellow' ml={3} fontWeight='bold'>{stunLevel}</Text>
            </Flex>
          </Flex>

          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={() => getData('bosses')}
              colorScheme="pink" variant="solid">
              Checkout Bosses
            </Button>

            <Flex direction='column' mt={3}>
              <NumberInput>
                {/* <NumberInput w={['15rem', '15rem']} mb={[8, 7]} > */}
                <NumberInputField color='yellow' value={inputBossId} placeholder="Enter Boss ID"
                  onChange={(e) => {
                    setInputBossId(parseInt(e.target.value));
                  }} />
              </NumberInput>

              <Flex mt={2}>
                <Text>Boss HP:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{bossHP}</Text>
              </Flex>

              <Flex>
                <Text>spawnBlock:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{spawnBlock}</Text>
              </Flex>

              <Flex>
                <Text>killBlock:</Text>
                <Text color='yellow' ml={3} fontWeight='bold'>{killBlock}</Text>
              </Flex>
            </Flex>
          </Flex>
        </Grid>

        <Text color='yellow' fontSize='2xl' mt={5}>Fighting</Text>
        <Divider />

        <Grid templateColumns={['repeat(2, 90vw)', 'repeat(4, 1fr)']} gap={6} mt={[0, 5]}>
          <Flex direction='column'>
            <Button px={10} leftIcon={<MdBuild />} onClick={fight}
              colorScheme="pink" variant="solid">
              Fight
            </Button>

            {/* <Flex direction='column' mt={3}>
              <Text>Game Name:</Text>
              <Text color='yellow'>{gameName}</Text>
            </Flex> */}
          </Flex>

        </Grid>

        {/* <Center mb={[10, 10]}>
          <Flex direction={['column', 'row']} mt={10}>
            <Image src={wow} mr={[0, 20]} />

            <Flex direction='column' align='center'>
              <Flex mt={3} mb={5} fontSize={['xl', '2xl']}>
                Begin your journey through Azeroth
              </Flex>

              <NumberInput w={['15rem', '15rem']} mb={[8, 7]} >
                <NumberInputField color='yellow' value={inputBagId} placeholder="Enter Bag ID"
                  onChange={(e) => {
                    setInputBagId(parseInt(e.target.value));
                  }} />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              <Flex>
                <Button px={10} leftIcon={<MdBuild />} onClick={clickClaimBtn}
                  colorScheme="pink" variant="solid">
                  Claim WOW LOOT
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Center> */}

        {/* <Flex w={['100%', '70%']} mt={3} fontSize='xl' color='gray'>
          The Doom Lord Kazzak reopened the Dark Portal to Outland, plaguing Azeroth
          with the ravenous demons of the Burning Legion. The Expeditionary Army from
          the Horde and Alliance passed through the gateway to resist the invasion at the frontend.
        </Flex> */}

        {/* <Flex w={['100%', '70%']} mt={3} fontSize='xl' color='gray'>
          Comrades, let us pick up our swords and scepters and get our hands armed.
          Let's fight our enemies together!
        </Flex> */}

        <Text color='yellow' fontSize='2xl' mt={5}>Links</Text>
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

        {/* <Divider mt={10} />
        <Flex mt={8} mb={2} fontSize='xl'>
          Links to WOW LOOT:
        </Flex>

        <Flex fontSize='2xl'>
          <Link mr={[2, 10]} href="https://opensea.io/collection/wowloot" isExternal>
            OpenSea <ExternalLinkIcon mx="2px" mb="3px" />
          </Link>
          <Link mr={[2, 10]} href="https://discord.gg/kKm8rZeZtJ" isExternal>
            Discord <ExternalLinkIcon mx="2px" mb="3px" />
          </Link>
          <Link mr={[0, 10]} href="https://twitter.com/Wloot01" isExternal>
            @Wloot01 <ExternalLinkIcon mx="2px" mb="3px" />
          </Link>
        </Flex> */}

        <Divider mt={8} />

      </Flex>
    </Center>
  );
}

export default Home;
