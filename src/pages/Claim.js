import { useState, useReducer, useCallback } from "react"
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

const Monitor = styled.div`
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


export default function Claim({ connection, account }) {

  const WAIT_TIME = new BigNumber(1000 * (3600 + 60))  // 61 minutes, to milliseconds


  const [ balances, setBalances ] = useState({
    base: account.balances.base,
    fsn: account.balances.fsn,
    free: account.balances.free,
    fmn: account.balances.fmn
  })
  const [ monitor, setMonitor ] = useState("-")



  const [ gas, dispatchGas ] = useReducer((state, gwei) => {
    if(gwei < 1) return "1"
    else return String(gwei)
  }, "1")

  const [ claimActive, dispatchClaimActive ] = useReducer((state, action) => {
    if(state.active && state.play) {
      return { active: true, play: false }
    } else if(state.active && !state.play) {
      return { active: true, play: true }
    } else {
      console.log("other")
    }
  }, { active: true, play: true })

  const [ nextTime, dispatchNextTime ] = useReducer((state, time) => {
    return time
  }, Date.now())



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



  const claim = async nextDate => {
    const connected = connect()
    const { provider, faucet } = connected

    const BATCH = 6 * 13
    const totalRequests = account.subscriptions

    let batches = []
    let requests = []

    let txCount = await provider.getTransactionCount(account.balances.base)

    // Starts at zero, stops after going through each request.
    for(let i = 0; i < totalRequests; i++) {
      // Derive current address, build tx ...
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${ i }`)
      requests.push(faucet.claim(current.address, {
        from: account.balances.base,
        gasLimit: "1000000",
        gasPrice: ethers.utils.parseUnits(gas, "gwei"),
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

    const claimInterval = setInterval(async () => {
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
          let mssg = fail > 0 ?
            `Claim success for ${ success }, failed ${ fail }. Next claim at ${ nextDate}`
              :
            `Claim success for ${ success }. Next claim at ${ nextDate }`

          setMonitor(mssg)
          const connected = connect()
          await getBalances(connected)
        }
      // Clear the interval if the batches are all confirmed.
      } else {
        clearInterval(claimInterval)
      }
    }, 15000)
  }


  const startClaiming = async () => {
    dispatchClaimActive()

    const singleClaim = async () => {
      let claimStartTime = Date.now()
      let nextClaimTime = WAIT_TIME.plus(claimStartTime).toNumber()
      dispatchNextTime(nextClaimTime)
      let nextClaimDate = (new Date(nextClaimTime)).toISOString().replace("T", " ")
      if(claimActive.play) {
        setMonitor(`Claiming for ${ account.subscriptions } bots.`)
        await claim(nextClaimDate)
      } else {
        clearInterval(hourlyClaimInterval)
        setMonitor(`Claiming stopped.`)
      }
    }

    const START_TIME = new BigNumber(Date.now())

    if(START_TIME.isGreaterThanOrEqualTo(nextTime)) {
      await singleClaim()
    }

    const hourlyClaimInterval = setInterval(singleClaim, WAIT_TIME)
  }



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
      <Input type="number" min="1" defaultValue={ gas } onChange={e => {
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
          { account.balances.base }
        </BodyValue>
        <SubHeading>
          Subscribed Bots
        </SubHeading>
        <BodyValue>
          { account.subscriptions }
        </BodyValue>
      </Body>
      <Heading>
        Start/Stop Claiming
      </Heading>
      <Body>
        <Row>
          <StartStop active={ claimActive.active } onClick={() => {
            if(claimActive.active) {
              startClaiming()
            }
          }}>
            { claimActive.play ? <FaPlay size={ 25 }/> : <FaStop size={ 25 }/> }
          </StartStop>
        </Row>
      </Body>
      <Monitor>
        { monitor }
      </Monitor>
      <Footer/>
    </MonitorContainer>
  )
}