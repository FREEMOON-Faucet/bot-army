import { useState, useEffect, useReducer, useCallback } from "react"
import styled from "styled-components"
import { ethers } from "ethers"
import BigNumber from "bignumber.js"

import Config from "../config.mjs"


const MonitorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Heading = styled.div`
  width: 80%;
  max-width: 600px;
  height: 25px;
  margin: 20px 0 10px;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
`

const Balances = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 80%;
  max-width: 300px;
  height: 200px;
  border: 1px solid black;
  border-radius: 5px;
`

const Row = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

const Value = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50%;
  height: 50px;
  font-size: 1.4rem;
  font-weight: ${props => props.symbol ? "900" : "300"};
`

const SubHeading = styled.div`
  width: 100%;
  height: 15px;
  margin: 10px 0 5px;
  font-size: 1.2rem;
  font-style: italic;
  text-align: center;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 500px;
  border: 1px solid black;
  border-radius: 5px;
`

const BodyValue = styled.div`
  width: 100%;
  margin: 5px 0 10px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 98%;
  max-width: 490px;
  height: 50px;
  margin: 5px 0;
  border-radius: 4px;
  font-size: 1.2rem;
  cursor: ${props => props.active ? "pointer" : "default"};
  background: ${props => props.active ? "rgb(146, 180, 227)" : "#ddd"};
  box-shadow: ${props => props.active ? "0px 4px 12px #ccc" : "0"};
`

const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 495px;
  height: 60px;
  margin: 15px 0;
  padding: 5px;
  border-radius: 6px;
  font-size: 1.6rem;
  font-weight: bold;
  cursor: ${ props => props.active ? "pointer" : "default" };
  background: ${ props => props.active ? "rgb(146, 180, 227)" : "#ddd" };
  box-shadow: ${ props => props.active ? "0px 4px 12px #ccc" : "0" };
`

const Input = styled.input`
  width: 100%;
  max-width: 495px;
  height: 50px;
  margin: 5px 0;
  padding: 0;
  border: 1px solid black;
  border-radius: 4px;
  outline: none;
  font-size: 1.5rem;
  text-align: center;
  line-height: 30px;
`


export default function Subscribe({ connection, count, setAccount }) {

  const ZERO = new BigNumber("0")


  const [ balances, setBalances ] = useState({
    base: "Please Wait ...",
    fsn: ZERO,
    free: ZERO,
    fmn: ZERO
  })
  const [ subscriptions, setSubscriptions ] = useState("Please Wait ...")
  const [ subscribeActive, setSubscribeActive ] = useState(false)
  const [ subMessage, setSubMessage ] = useState("Subscribe All")
  const [ continueActive, setContinueActive ] = useState(false)



  const [ gas, dispatchGas ] = useReducer((state, gwei) => {
    if(gwei < 1) return "1"
    else return String(gwei)
  }, "1")



  const connect = useCallback(() => {
    const FAUCET_ABI = Config.abi
    const ERC20_ABI = Config.erc20Abi

    const provider = new ethers.providers.JsonRpcProvider(connection.provider)
    const base = ethers.Wallet.fromMnemonic(connection.phrase)
    const signer = base.connect(provider)

    let faucetAddr, freeAddr, fmnAddr
    
    if(connection.network === "mainnet") {
      faucetAddr = Config.mainnet.faucet
      freeAddr = Config.mainnet.free
      fmnAddr = Config.mainnet.fmn
    } else if(connection.network === "testnet") {
      faucetAddr = Config.testnet.faucet
      freeAddr = Config.testnet.free
      fmnAddr = Config.testnet.fmn
    }

    const faucet = new ethers.Contract(faucetAddr, FAUCET_ABI, signer)
    const free = new ethers.Contract(freeAddr, ERC20_ABI, provider)
    const fmn = new ethers.Contract(fmnAddr, ERC20_ABI, provider)

    return { provider, signer, base, faucet, free, fmn }
  }, [ connection ])


  const getBalances = useCallback(async connected => {
    const { provider, base, free, fmn } = connected

    const fsnBal = new BigNumber(ethers.utils.formatUnits(await provider.getBalance(base.address), 18))
    const freeBal = new BigNumber(ethers.utils.formatUnits(await free.balanceOf(base.address), 18))
    const fmnBal = new BigNumber(ethers.utils.formatUnits(await fmn.balanceOf(base.address), 18))

    setBalances({
      base: base.address,
      fsn: fsnBal,
      free: freeBal,
      fmn: fmnBal
    })
  }, [])



  const getSubscriptions = useCallback(async connected => {
    const { faucet } = connected
    const BATCH = 6 * 13
    const totalRequests = count

    let batches = []
    let requests = []

    for(let i = 0; i < totalRequests; i++) {
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${ i }`)
      requests.push(faucet.isSubscribed(current.address))
      if(requests.length === BATCH || i === totalRequests - 1) {
        batches.push(requests)
        requests = []
      }
    }

    let subscribedAccounts = 0
    let currentBatch = 0

    const checkSubscribersInterval = setInterval(async () => {
      if(currentBatch < batches.length) {
        let check = currentBatch
        currentBatch++
        let results = await Promise.all(batches[ check ])
        subscribedAccounts += results.filter(Boolean).length

        if(currentBatch === batches.length) {
          setSubscriptions(subscribedAccounts)
        }
      } else {
        clearInterval(checkSubscribersInterval)
      }
    }, 15000)
  }, [ connection, count ])


  const subscribeAll = async () => {
    setSubscribeActive(false)
    const connected = connect()
    const { provider, base, faucet } = connected

    const baseBal = ethers.utils.formatUnits(await provider.getBalance(base.address), 18)

    const BATCH = 6 * 13
    const totalRequests = count - subscriptions

    setSubMessage(`Subscribing ${ totalRequests }`)

    if(baseBal < totalRequests) {
      setSubMessage(`Not enough FSN to pay subscription fees.`)
      return
    }

    let batches = []
    let requests = []

    let txCount = await provider.getTransactionCount(base.address)

    // Starts at zero, stops after going through each request.
    for(let i = 0; i < totalRequests; i++) {
      // Derive current address, build tx ...
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${ subscriptions + i }`)
      requests.push(faucet.subscribe(current.address, {
        from: base.address,
        gasLimit: "1000000",
        gasPrice: ethers.utils.parseUnits(gas, "gwei"),
        value: ethers.utils.parseUnits("1.0", 18),
        nonce: txCount + i
      }))

      // If a batch has been filled OR it is the last request to be made, add it to batches and reset current requests ...
      if(requests.length === BATCH || i === totalRequests - 1) {
        batches.push(requests)
        requests = []
      }
    }

    let success = 0, fail = 0
    let currentBatch = 0

    const subscribeInterval = setInterval(async () => {
      // If there are batches not yet confirmed, do so ...
      if(currentBatch < batches.length) {
        let check = currentBatch
        currentBatch++

        // Wait for the tx's to confirm ...
        let results = await Promise.allSettled(batches[ check ])

        // Tally fulfilled and rejected tx's ...
        success += results.filter(res => res.status === "fulfilled").length
        fail += results.filter(res => res.status === "rejected").length

        if(currentBatch === batches.length) {
          let mssg = fail > 0 ? `Subscribed ${ success }, failed ${ fail }.` : `Subscribed ${ success }.`
          setSubMessage(mssg)
          const connected = connect()
          getBalances(connected)
          await getSubscriptions(connected)
        }
      // Clear the interval if the batches are all confirmed.
      } else {
        clearInterval(subscribeInterval)
      }
    }, 15000)
  }



  useEffect(() => {
    const connected = connect()
    getBalances(connected)
    getSubscriptions(connected)
  }, [ connect, getBalances, getSubscriptions ])


  useEffect(() => {
    if(subscriptions < count) setSubscribeActive(true)
    else if(Number(subscriptions) === Number(count)) setContinueActive(true)
  }, [ subscriptions, count ])



  return (
    <MonitorContainer>
      <Heading>
        Balances
      </Heading>
      <Balances>
        <Row>
          <Value symbol={ true }>
            FSN
          </Value>
          <Value>
            { balances.fsn.toFixed(4) }
          </Value>
        </Row>
        <Row>
          <Value symbol={ true }>
            FREE
          </Value>
          <Value>
            { balances.free.toFixed(4) }
          </Value>
        </Row>
        <Row>
          <Value symbol={ true }>
            FMN
          </Value>
          <Value>
            { balances.fmn.toFixed(4) }
          </Value>
        </Row>
      </Balances>
      <Heading>
        Gas Price (gwei)
      </Heading>
      <Input type="number" min="1" defaultValue={ Number(gas) } onChange={e => {
        dispatchGas(e.target.value)
      }}/>
      <Heading>
        My Bot Army
      </Heading>
      <Body>
        <SubHeading>
          Base Address
        </SubHeading>
        <BodyValue>
          { balances.base }
        </BodyValue>
        <SubHeading>
          Total Bots
        </SubHeading>
        <BodyValue>
          { count }
        </BodyValue>
        <SubHeading>
          Subscribed Bots
        </SubHeading>
        <BodyValue>
          { subscriptions }
        </BodyValue>
        <Action active={ subscribeActive } onClick={ () => subscribeActive ? subscribeAll() : "" }>
          { subMessage }
        </Action>
      </Body>
        <Button active={ continueActive } onClick={ () => continueActive ? setAccount({ subscriptions, balances }) : "" }>
          Continue
        </Button>
    </MonitorContainer>
  )
}
