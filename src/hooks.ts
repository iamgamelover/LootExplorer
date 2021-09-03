import { useState, useEffect } from 'react'
import { useWeb3React } from '@web3-react/core'
import { injected, walletconnect } from './connectors';
// import { key_curr_wallect_index, kMetamaskConnection } from '../pojo';

export const key_duet_curr_user_account = "duet_curr_user_account";
export const key_curr_wallect_index = "urr_wallect_index";
export const kMetamaskConnection = "metamask_conn";

export function useEagerConnect() {
  const { activate, active } = useWeb3React()
  const [tried, setTried] = useState(false)

  useEffect(() => {
    // if (localStorage.getItem(key_curr_wallect_index) === "0") {
    if (localStorage.getItem(kMetamaskConnection) === "0") { // Connected Metamask
      injected.isAuthorized().then((isAuthorized: boolean) => {
        if (isAuthorized) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      })
    } else {
      setTried(true)
    }

  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (!tried && active) {
      setTried(true)
    }
  }, [tried, active])

  return tried
}

export function useInactiveListener(suppress: boolean = false) {
  const { active, error, activate } = useWeb3React()

  useEffect((): any => {
    const { ethereum } = window as any

    if (ethereum && ethereum.on && !active && !error && !suppress) {

      const handleConnect = () => {
        // console.log("Handling 'connect' event",localStorage.getItem(key_curr_wallect_index))
        if (localStorage.getItem(kMetamaskConnection) === "0") {
          activate(injected)
        }

        if (localStorage.getItem(key_curr_wallect_index) === "1") {
          activate(walletconnect)
        }
      }

      const handleChainChanged = (chainId: string | number) => {
        // console.log("Handling 'chainChanged' event with payload", chainId)
        if (localStorage.getItem(kMetamaskConnection) === "0") {
          activate(injected)
        }

        if (localStorage.getItem(key_curr_wallect_index) === "1") {
          activate(walletconnect)
        }
      }

      const handleAccountsChanged = (accounts: string[]) => {
        // console.log("Handling 'accountsChanged' event with payload", accounts)
        if (accounts.length > 0) {
          if (localStorage.getItem(kMetamaskConnection) === "0") {
            activate(injected)
          }

          if (localStorage.getItem(key_curr_wallect_index) === "1") {
            activate(walletconnect)
          }
        } else {
          localStorage.removeItem(kMetamaskConnection);
          localStorage.removeItem(key_curr_wallect_index);
        }
      }
      
      const handleNetworkChanged = (networkId: string | number) => {
        // console.log("Handling 'networkChanged' event with payload", networkId)
        activate(injected)
      }

      ethereum.on('connect', handleConnect)
      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)
      ethereum.on('networkChanged', handleNetworkChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('connect', handleConnect)
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
          ethereum.removeListener('networkChanged', handleNetworkChanged)
        }
      }
    }
  }, [active, error, suppress, activate])
}
