import { useEffect, useState, useRef } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import { FaStop, FaPlay } from "react-icons/fa"
import { ethers } from "ethers"

import Config from "../../shared/config.mjs"

const FAUCET_ABI = Config.abi
const ERC20_ABI = Config.erc20Abi

const FAUCET_ADDR =Config.testnet.faucet
const FREE_ADDR = Config.testnet.free
const FMN_ADDR = Config.testnet.fmn

const WAIT_TIME = 1000 * (3600 + 60)  // 61 minutes, to milliseconds

let claimInterval


const MonitorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
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

const Heading = styled.div`
  width: 80%;
  max-width: 600px;
  height: 25px;
  margin: 20px 0 10px;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
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
  width: 50%;
  max-width: 245px;
  height: 100px;
  margin: ${props => props.start ? "10px 5px 10px 10px" : "10px 10px 10px 5px"};
  border-radius: 4px;
  cursor: ${props => props.active ? "pointer" : "default"};
  background: ${props => props.active ? "rgb(146, 180, 227)" : "#ddd"};
  box-shadow: ${props => props.active ? "0px 4px 12px #ccc" : "0"};
`

const Footer = styled.div`
  width: 100%;
  height: 50px;
`

export default function Monitor({ connection }) {

  const count = useRef(1)

  const [ botList, setBotList ] = useState([])
  const [ gasPrice, setGasPrice ] = useState("1")

  const [ balances, setBalances ] = useState({
    base: "-",
    fsn: 0,
    free: 0,
    fmn: 0
  })
  const [ botSubStatus, setBotSubStatus ] = useState({
    total: "-",
    subs: "-",
    nonSubs: "-"
  })

  const [ confirmActive, setConfirmActive ] = useState(true)
  const [ subscribeActive, setSubscribeActive ] = useState(false)
  const [ startActive, setStartActive ] = useState(false)
  const [ stopActive, setStopActive ] = useState(false)


  useEffect(() => {
    const getBalances = async () => {
      const provider = new ethers.providers.JsonRpcProvider(connection.provider)
      const base = ethers.Wallet.fromMnemonic(connection.phrase)
  
      const free = new ethers.Contract(FREE_ADDR, ERC20_ABI, provider)
      const fmn = new ethers.Contract(FMN_ADDR, ERC20_ABI, provider)

      const fsnBal = ethers.utils.formatUnits(await provider.getBalance(base.address), 18)
      const freeBal = ethers.utils.formatUnits(await free.balanceOf(base.address), 18)
      const fmnBal = ethers.utils.formatUnits(await fmn.balanceOf(base.address), 18)

      setBalances({
        base: base.address,
        fsn: Number(fsnBal),
        free: Number(freeBal),
        fmn: Number(fmnBal)
      })

    }
    if(connection) getBalances()
  }, [ connection ])


  const getAllAddresses = async provider => {
    let list = []
    for(let i = 0; i < count.current; i++) {
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${i}`)
      list.push(current.address)
    }
    
    return list
  }


  const confirmBotAmount = async () => {
    setConfirmActive(false)
    const provider = new ethers.providers.JsonRpcProvider(connection.provider)
    const faucet = new ethers.Contract(FAUCET_ADDR, FAUCET_ABI, provider)

    let total = 0
    let subscribed = 0
    let notSubscribed = 0
    
    for(let i = 0; i < count.current; i++) {
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${i}`)
      const is = await faucet.isSubscribed(current.address)
      is ? subscribed++ : notSubscribed++
      total++
    }

    setBotSubStatus({
      total: String(total),
      subs: String(subscribed),
      nonSubs: String(notSubscribed)
    })

    if(notSubscribed > 0) setSubscribeActive(true)
    else if(notSubscribed === 0) setStartActive(true)
  }


  const subscribeAll = async () => {
    setSubscribeActive(false)
    const provider = new ethers.providers.JsonRpcProvider(connection.provider)
    const base = ethers.Wallet.fromMnemonic(connection.phrase)
    const signer = base.connect(provider)

    const faucet = new ethers.Contract(FAUCET_ADDR, FAUCET_ABI, signer)

    let subs = 0
    let nonSubs = 0

    for(let i = 0; i < botSubStatus.total; i++) {
      let current = ethers.Wallet.fromMnemonic(connection.phrase, `m/44'/60'/0'/0/${i}`)
      const is = await faucet.isSubscribed(current.address)
      
      if(is) {
        subs++
        continue
      }

      try {
        console.log(`Subscribing ${current.address} ...`)
        const tx = await faucet.subscribe(current.address, { value: ethers.utils.parseUnits("1.0", 18) })
        console.log(`Waiting ...`)
        await tx.wait()
        subs++
        console.log(`Completed.`)
        setBotSubStatus({
          total: botSubStatus.total,
          subs: subs,
          nonSubs: nonSubs
        })
      } catch(err) {
        nonSubs++
        console.log(err.message)
      }
    }

    setStartActive(true)
  }


  const start = async () => {
    console.log(`Ready to claim for phrase "${connection.phrase}" for ${botSubStatus.total} bots. Gas Price: ${gasPrice}.`)
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
            { balances.fsn.toFixed(4) }
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FREE
          </Value>
          <Value>
            { balances.free.toFixed(4) }
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FMN
          </Value>
          <Value>
            { balances.fmn.toFixed(4) }
          </Value>
        </Row>
      </Balances>
      <Heading>
        Number of Bots
      </Heading>
      <Input type="number" min="1" defaultValue={1} onChange={e => count.current = e.target.value}/>
      <Action active={confirmActive} onClick={() => confirmActive ? confirmBotAmount() : ""}>
        Confirm
      </Action>
      <Heading>
        Gas Price (gwei)
      </Heading>
      <Input type="number" min="1" defaultValue={1} onChange={e => setGasPrice(String(e.target.value))}/>
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
        <Action active={subscribeActive} onClick={() => subscribeActive ? subscribeAll() : ""}>
          Subscribe All
        </Action>
      </Body>
      <Heading>
        Start/Stop Claiming
      </Heading>
      <Body>
        <Row>
          <StartStop active={startActive} onClick={() => startActive ? start() : ""} start={true}>
            <FaPlay size={25}/>
          </StartStop>
          <StartStop>
            <FaStop size={25}/>
          </StartStop>
        </Row>
      </Body>
      <Footer/>
    </MonitorContainer>
  )
}