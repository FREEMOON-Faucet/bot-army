import { useState, useEffect, useRef, useReducer } from "react"
import styled from "styled-components"
import { ethers } from "ethers"
import { FaStop, FaPlay } from "react-icons/fa"
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

const StartStop = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 98%;
  max-width: 500px;
  height: 100px;
  margin: 10px;
  border-radius: 4px;
  cursor: ${props => props.active ? "pointer" : "default"};
  background: ${props => props.active ? "rgb(146, 180, 227)" : "#ddd"};
  box-shadow: ${props => props.active ? "0px 4px 12px #ccc" : "0"};
`

const MonitorAction = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 600px;
  height: 150px;
  margin-top: 20px;
  padding: 5px;
  border-radius: 5px;
  font-size: 1.4rem;
  background: #ddd;
  box-shadow: 0px 4px 12px #ccc;
  text-align: center;
`

const Footer = styled.div`
  width: 100%;
  height: 50px;
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


export default function Monitor({ connection, count }) {

  const WAIT_MESSAGE = "Please Wait ..."
  const WAIT_TIME = 1000 * (3600 + 60)  // 61 minutes, to milliseconds
  // const WAIT_TIME = 20000
  const CLAIMS_PER_BLOCK = 6 * 13

  const FAUCET_ABI = Config.abi
  const ERC20_ABI = Config.erc20Abi
  
  const FAUCET_ADDR =Config.testnet.faucet
  const FREE_ADDR = Config.testnet.free
  const FMN_ADDR = Config.testnet.fmn

  const ONE = new BigNumber("1")
  const ONE_BILLION = new BigNumber("1000000000")


  const currentBot = useRef(0)


  const [ monitor, dispatch ] = useReducer((currentState, action) => {
    return action
  }, { message: `...` })


  const [ control, dispatchControl ] = useReducer((state, action) => {
    return action
  }, { active: false, play: false })


  const [ time, dispatchTime ] = useReducer((state, action) => {
    return action
  }, { nextClaim: Date.now() })


  const [ subscribing, dispatchSubscribing ] = useReducer((state, action) => {
    return action
  }, { status: false })


  const [ gasPrice, dispatchGas ] = useReducer((state, action) => {
    return action
  }, ONE_BILLION)


  const [ balances, setBalances ] = useState({
    base: WAIT_MESSAGE,
    fsn: WAIT_MESSAGE,
    free: WAIT_MESSAGE,
    fmn: WAIT_MESSAGE
  })
  const [ botSubStatus, setBotSubStatus ] = useState({
    total: WAIT_MESSAGE,
    subs: WAIT_MESSAGE,
    nonSubs: WAIT_MESSAGE
  })
  const [ subscribeActive, setSubscribeActive ] = useState(false)
  const [ running, setRunning ] = useState(false)


  useEffect(() => {
    if(connection && count) {
      const providerAbs = providers()
      getBalances(providerAbs)
      getSubCount(providerAbs)
    }
  }, [ connection, count ])


  useEffect(() => {
    if(botSubStatus.nonSubs > 0) {
      setSubscribeActive(true)
    } else if(botSubStatus.nonSubs === 0) {
      dispatch({ message: `Start claiming for subscribed bot addresses.` })
      dispatchControl({
        active: true,
        play: true
      })
    }
  }, [ botSubStatus ])


  useEffect(() => {
    if(running) {
      dispatchControl({
        active: true,
        play: false
      })

      dispatch({ message: `Claiming ...`})
      
      if(Date.now() >= time.nextClaim) {
        start()
      }

      const claimInterval = setInterval(() => start(), WAIT_TIME)

      return  () => {
        setRunning(false)
        clearInterval(claimInterval)
      }
    } else {
      dispatch({ message: `Stopped` })
      dispatchControl({
        active: true,
        play: true
      })
    }
  }, [ running ])


  const providers = () => {
    const provider = new ethers.providers.JsonRpcProvider(connection.provider)
    const base = ethers.Wallet.fromMnemonic(connection.phrase)
    const signer = base.connect(provider)

    const faucet = new ethers.Contract(FAUCET_ADDR, FAUCET_ABI, signer)
    const free = new ethers.Contract(FREE_ADDR, ERC20_ABI, provider)
    const fmn = new ethers.Contract(FMN_ADDR, ERC20_ABI, provider)

    return { provider, signer, base, faucet, free, fmn }
  }

  const getBalances = async ({ provider, base, free, fmn }) => {
    const fsnBal = ethers.utils.formatUnits(await provider.getBalance(base.address), 18)
    const freeBal = ethers.utils.formatUnits(await free.balanceOf(base.address), 18)
    const fmnBal = ethers.utils.formatUnits(await fmn.balanceOf(base.address), 18)

    setBalances({
      base: base.address,
      fsn: Number(fsnBal).toFixed(4),
      free: Number(freeBal).toFixed(4),
      fmn: Number(fmnBal).toFixed(4)
    })
  }




  const getSubCount = async ({ faucet }) => {
    let is = []
    let total = 0
    let subscribed = 0
    let notSubscribed = 0
    
    for(let i = 0; i < count; i++) {
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${i}`)
      is.push(faucet.isSubscribed(current.address))
    }

    let isRes = await Promise.all(is)
    
    for(let i = 0; i < isRes.length; i++) {
      isRes[i] ? subscribed++ : notSubscribed++
      total++
    }

    setBotSubStatus({
      total: total,
      subs: subscribed,
      nonSubs: notSubscribed
    })
  }




  const subscribeAll = async () => {
    setSubscribeActive(false)
    dispatch({ message: `Subscribing ${botSubStatus.nonSubs} ...` })
    dispatchSubscribing({ status: true })
    const { base, provider, faucet, free, fmn } = providers()

    const bal = ethers.utils.formatUnits(await provider.getBalance(base.address), 18)

    if(bal < botSubStatus.nonSubs) {
      dispatch({ message: `Base address does not have enough FSN for subscription fees. Minimum Required FSN: ${botSubStatus.nonSubs}` })
      return
    }

    let txCount = await provider.getTransactionCount(base.address)

    let success = 0, fail = 0
    let txs = []
    let j = 0

    for(let i = 0; i < botSubStatus.total; i++) {
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${i}`)
      const is = await faucet.isSubscribed(current.address)
      
      if(is) {
        continue
      }

      txs.push(faucet.subscribe(current.address, { value: ethers.utils.parseUnits("1.0", 18), gasPrice: gasPrice, nonce: txCount + j }))
      j++
    }

    const sentTxs = await Promise.all(txs)

    let txsToWait = sentTxs.map(tx => tx.wait())

    const results = await Promise.allSettled(txsToWait)

    success += (results.filter(res => res.status === "fulfilled")).length
    fail += (results.filter(res => res.status === "rejected")).length

    dispatch({ message: `Subscribed ${success}, failed ${fail}, updating balances ...` })

    await getBalances({ provider, base, free, fmn })
    await getSubCount({ faucet })
    dispatchSubscribing({ status: false })
  }




  const start = async () => {
    const { provider, base, faucet, free, fmn } = providers()
    let currentGasPrice = gasPrice.toString()
    let nextClaim = Date.now() + WAIT_TIME
    dispatchTime({ nextClaim: nextClaim })

    let txCount = await provider.getTransactionCount(base.address)

    let success = 0
    let fail = 0

    const claiming = setInterval(async () => {
      if(running && currentBot.current < botSubStatus.subs) {
        let nextLoad = []
        let max = CLAIMS_PER_BLOCK < botSubStatus.subs ? CLAIMS_PER_BLOCK : botSubStatus.subs
        for(let i = currentBot.current; i < max; i++) {
          let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${currentBot.current + i}`)
          nextLoad.push(current.address)
        }
        currentBot.current += max

        let txs = []

        for(let j = 0; j < max; j++) {
          txs.push(faucet.claim(nextLoad[j], { gasLimit: "1000000", gasPrice: currentGasPrice, nonce: txCount + j }))
        }

        txCount += max

        let sentTxs = await Promise.all(txs)
        
        let txsToWait = sentTxs.map(tx => tx.wait())

        const results = await Promise.allSettled(txsToWait)

        success += (results.filter(res => res.status === "fulfilled")).length
        fail += (results.filter(res => res.status === "rejected")).length

        await getBalances({ provider, base, free, fmn })

        dispatch({ message: `${success} successful and ${fail} failed, next claim at ${(new Date(nextClaim)).toISOString()}.` })
      } else {
        dispatch({ message: `Claim transactions sent, next claim at ${(new Date(nextClaim)).toISOString()}.`})
        clearInterval(claiming)
        currentBot.current = 0
      }
    }, 15000)
  }




  return (
    <MonitorContainer>
      <Heading>
        Balances
      </Heading>
      <Balances>
        <Row>
          <Value symbol={true}>
            FSN
          </Value>
          <Value>
            { balances.fsn }
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FREE
          </Value>
          <Value>
            { balances.free }
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FMN
          </Value>
          <Value>
            { balances.fmn }
          </Value>
        </Row>
      </Balances>
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
          { botSubStatus.total }
        </BodyValue>
        <SubHeading>
          Subscribed Bots
        </SubHeading>
        <BodyValue>
          { botSubStatus.subs }
        </BodyValue>
        <Action active={ subscribeActive } onClick={() => subscribeActive ? subscribeAll() : ""}>
          Subscribe All
        </Action>
      </Body>
      <Heading>
        Gas Price (gwei)
      </Heading>
      <Input type="number" min="1" defaultValue={ ONE.toNumber() } onChange={e => {
        if(!subscribing.status && !running) {
          dispatchGas(new BigNumber(e.target.value).multipliedBy(ONE_BILLION))
        }
      }}/>
      <Heading>
        Start/Stop Claiming
      </Heading>
      <Body>
        <Row>
          <StartStop active={ control.active } onClick={() => {
            if(control.active && control.play && !subscribing.status && (botSubStatus.total === botSubStatus.subs)) {
              setRunning(true)
            } else if(control.active && !control.play && !subscribing.status) {
              setRunning(false)
            }
          }}>
            { control.active && !control.play ? <FaStop size={25}/> : <FaPlay size={25}/> }
          </StartStop>
        </Row>
      </Body>
      <MonitorAction>
        { monitor.message }
      </MonitorAction>
      <Footer/>
    </MonitorContainer>
  )
}