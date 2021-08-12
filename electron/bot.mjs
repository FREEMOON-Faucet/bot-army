
import Web3 from "web3"
import Config from "./config.mjs"

const ABI = Config.ABI
const FAUCET_ADDR =Config.mainnet.address
const PROVIDER = Config.mainnet.provider


const setUpWeb3 = async () => {
  const web3 = new Web3(PROVIDER)
  const faucet = new web3.eth.Contract(ABI, FAUCET_ADDR)
  
  return { web3, faucet }
}


const createWallet = async (walletSettings, web3) => {
  const { count, phrase } = walletSettings
  const accounts = await web3.eth.accounts.wallet.create(count, phrase)
  return accounts
}


const checkSubscribe = async (faucet, acc) {
  const is = await faucet.methods.isSubscribed(acc).call()
  return is
}


const subscribeAll = async (faucet, web3, accounts) => {
  const base = accounts[0]
  let successful = 0
  let already = 0
  let failure = 0

  for(let i = 0; i < accounts.length; i++) {
    let acc = accounts[i]
    
    const isSubscribed = await checkSubscribe(faucet, acc)
    
    if(isSubscribed) {
      already++
      continue
    }

    try {
      await faucet.methods.subscribe(acc).send({ from: base, value: web3.utils.toWei("1", "ether"), gasPrice: web3.utils.toWei("1", "gwei") })
      successful++
    } catch(err) {
      failure++
    }
  }

  return {
    message: `Subscribing was successful for ${successful} accounts, ${already} already subscribed, ${failure} failed.`
  }
}


const claimAll = async (faucet, web3, accounts) => {
  const base = accounts[0]
  let successful = 0
  let notSubs = 0
  let badTime = 0
  let failure = 0
  
  for(let i = 0; i < accounts.length; i++) {
    let acc = accounts[i]
    try {
      const isSubscribed = await checkSubscribe(faucet, acc)
      if(!isSubscribed) {
        notSubs++
        continue
      }
      await faucet.methods.claim(acc).send({ from: base, gasPrice: web3.utils.toWei("1", "gwei") })
      successful++
    } catch(err) {
      throw new Error(`Error claiming for account ${acc}: ${err.message}`)
    }
  }

  return {
    message: `Claiming FREE was successful for ${successful} accounts, ${notSubs} not subscribed, ${badTime} pre-cooldown, ${failure} failed.`
  }
}


const run = async (action, walletSettings) => {
  const { web3, faucet } = await setUpWeb3()
  const accounts = await createWallet(walletSettings, web3)
  let result

  if(action === 0) { // Subscribe all address not currently subscribed.
    try {
      await subscribeAll(faucet, web3, accounts)
    } catch(err) {
      throw new Error(`Error subscribing addresses: ${err.message}`)
    }
  } else if(action === 1) { // Claim for all subscribed addresses.
    try {
      result = await claimAll(faucet, web3, accounts)
    } catch(err) {
      throw new Error(`Error running bot: ${err.message}`)
    }
  } else if(action === 2) { // 
    return accounts
  }

}