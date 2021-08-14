
const { ethers } = require("ethers")
const Config = require("../src/shared/config")

const FAUCET_ABI = Config.abi
const ERC20_ABI = Config.erc20Abi

const FAUCET_ADDR =Config.mainnet.faucet
const FREE_ADDR = Config.mainnet.free
const FMN_ADDR = Config.mainnet.fmn

const PROVIDER = Config.mainnet.provider

const WAIT_TIME = 1000 * (3600 + 60)  // 61 minutes, to milliseconds

let claimInterval


const connect = phrase => {
  const provider = new ethers.providers.JsonRpcProvider(PROVIDER)
  ethers.Wallet.fromMnemonic(phrase)
  const signer = provider.getSigner()

  const faucet = new ethers.Contract(FAUCET_ADDR, FAUCET_ABI)
  const free = new ethers.Contract(FREE_ADDR, ERC20_ABI)
  const fmn = new ethers.Contract(FMN_ADDR, ERC20_ABI)
  
  return { ethers, faucet, free, fmn, signer }
}


const checkSubscribe = async (faucet, acc) => {
  const is = await faucet.methods.isSubscribed(acc).call()
  return is
}


const getAccounts = async accounts => {
  return accounts.map(acc => acc.address)
}


const getTokenBalances = async acc => {
  const { web3, free, fmn } = connect()
  const freeBal = web3.utils.fromWei(await free.methods.balanceOf(acc).call())
  const fmnBal = web3.utils.fromWei(await fmn.methods.balanceOf(acc).call())

  return { freeBal, fmnBal }
}


const claimAll = async accounts => {
  const { faucet } = connect()
  const base = accounts[0]
  
  for(let i = 0; i < accounts.length; i++) {
    let acc = accounts[i]
    const isSub = await checkSubscribe(faucet, acc)

    if(!isSub) continue

    try {
      console.log(`Claiming for ${acc} ...`)
      await faucet.methods.claim(acc).send({ from: base })
    } catch(err) {
      throw new Error(`Error claiming for account ${acc}: ${err.message}`)
    }
  }
}


const subscribeAll = async accounts => {
  const { web3, faucet } = connect()
  const base = accounts[0]

  for(let i = 0; i < accounts.length; i++) {
    let acc = accounts[i]
    const isSub = await checkSubscribe(faucet, acc)
    
    if(isSub) continue

    try {
      console.log(`Subscribing ${acc} ...`)
      await faucet.methods.subscribe(acc).send({ from: base, value: web3.utils.toWei("1", "ether") })
    } catch(err) {
      throw new Error(`Error subscribing account ${acc}: ${err.message}`)
    }
  }
}


const startClaiming = async accounts => {
  claimInterval = setInterval(claimAll, WAIT_TIME)
}


const stopClaiming = async accounts => {
  clearInterval(claimInterval)
}


module.exports = {
  connect
}
