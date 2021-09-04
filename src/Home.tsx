import React, { useState } from 'react';
import './App.css';
import {
  Center, Button, Image, Divider, Flex, Heading, Link, Modal, ModalBody,
  ModalContent, ModalOverlay, Text, useDisclosure
} from "@chakra-ui/react"
import { theme } from './theme';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { MdAccountBalanceWallet, MdBuild } from "react-icons/md"
import logo from './iconZerogoki.svg';
import iconMetamask from './iconMetamask.svg';
import iconWalletConnect from './iconWalletConnect.svg';
import bg from './bg.jpg';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { defaultWalletProvider, getNewWalletConnectInstance, injected, walletconnect } from './connectors';
import { key_curr_wallect_index, key_duet_curr_user_account, kMetamaskConnection, useEagerConnect, useInactiveListener } from './hooks';
import { AbstractConnector } from '@web3-react/abstract-connector';
import Web3 from 'web3';

var currUserAccount: any;
export var currUserAccountSigner: any;

function Home() {
  console.info('currUserAccount: ', currUserAccount);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const context = useWeb3React<Web3Provider>();
  const { connector, library, account, activate, deactivate, chainId } = context;

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

  function getAccountString() {
    let myAccount = currUserAccount.substring(0, 6) + '...' +
      currUserAccount.substring(currUserAccount.length - 4);
    return myAccount;
  }

  function BeforeConnect() {
    return (
      <Button onClick={onOpen} px={5} leftIcon={<MdAccountBalanceWallet />}
        colorScheme="green" variant="solid">
        Connect Wallet
      </Button>
    )
  }

  function AfterConnect() {
    return (
      <Button px={5} leftIcon={<MdAccountBalanceWallet />}
        colorScheme="green" variant="solid">

        <Text> {getAccountString()} </Text>
      </Button>
    )
  }

  // ROOT
  return (
    // <Center bgImage={bg}>
    <Center>
      <Flex direction='column' w='80%' px={20} py={10}>
        <Flex justify="space-between" align="center">
          <Text fontSize='6xl'>wowLOOT</Text>
          <Flex>
            {currUserAccount === undefined ? <BeforeConnect /> : <AfterConnect />}
            <ConnectWalletModal />
          </Flex>
        </Flex>

        <Flex mt={1} mb={5} fontSize='2xl'>
          By @Duet
        </Flex>

        <Flex w='70%' mt={3} fontSize='xl' color='gray'>
          wowLOOT is a separate universe based on Azeroth and Outland during the Burning Crusade.
        </Flex>

        <Flex w='70%' mt={3} fontSize='xl' color='gray'>
          The Doom Lord Kazzak reopened the Dark Portal to Outland, flooding Azeroth with
          the ravenous demons of the Burning Legion. Expeditions from the Horde and Alliance,
          passed through the gateway to stop the invasion at its source.
        </Flex>

        <Flex w='70%' mt={3} fontSize='xl' color='gray'>
          Players, let us raise the hands of the sword and scepter, face the enemy together!
        </Flex>

        <Flex mt={10} mb={5} fontSize='xl'>
          Links to origin of the Loots:
        </Flex>

        <Flex fontSize='xl'>
          <Link mr={10} href="https://opensea.io/collection/lootproject" isExternal>
            OpenSea <ExternalLinkIcon mx="2px" />
          </Link>
          <Link mr={10} href="https://discord.gg/NXEntTSHgy" isExternal>
            Discord <ExternalLinkIcon mx="2px" />
          </Link>
          <Link mr={10} href="https://twitter.com/lootproject" isExternal>
            @lootproject <ExternalLinkIcon mx="2px" />
          </Link>
        </Flex>

        <Divider mt={10} />
        <Flex mt={8} mb={2} fontSize='xl'>
          Links to wowLOOT:
        </Flex>

        <Flex>
          <Link fontSize="2xl" mr={10} href="" isExternal>
            OpenSea <ExternalLinkIcon mx="2px" />
          </Link>
          <Link fontSize="2xl" mr={10} href="" isExternal>
            Discord <ExternalLinkIcon mx="2px" />
          </Link>
          <Link fontSize="2xl" mr={10} href="https://twitter.com/lootproject" isExternal>
            @wowloot <ExternalLinkIcon mx="2px" />
          </Link>
        </Flex>

        <Divider mt={8} />
        <Flex mt={10}>
          <Image src={logo} mr={20} />

          <Flex direction='column'>
            <Flex mt={3} mb={5} fontSize='2xl'>
              Begin your journey through Azeroth
            </Flex>
            <Button leftIcon={<MdBuild />} colorScheme="pink" variant="solid">
              Claim wowLOOT
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Center>
  );
}

export default Home;
