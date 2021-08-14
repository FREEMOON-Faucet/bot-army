import { useEffect, useState } from "react"
import styled from "styled-components"
import BigNumber from "bignumber.js"
import { ethers } from "ethers"

import Config from "../../shared/config"

const { ipcRenderer } = window

const FAUCET_ABI = Config.abi
const ERC20_ABI = Config.erc20Abi

const FAUCET_ADDR =Config.mainnet.faucet
const FREE_ADDR = Config.mainnet.free
const FMN_ADDR = Config.mainnet.fmn

const PROVIDER = Config.mainnet.provider

const WAIT_TIME = 1000 * (3600 + 60)  // 61 minutes, to milliseconds

let claimInterval


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
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

const Balances = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  width: 80%;
  max-width: 400px;
  height: 200px;
  border: 2px solid black;
  border-radius: 4px;
`

const Row = styled.div`
  display: flex;
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

export default function Monitor({ phrase }) {

  const ZERO = new BigNumber("0")

  const [ balances, setBalances ] = useState({
    fsn: ZERO,
    free: ZERO,
    fmn: ZERO
  })


  useEffect(() => {
    const connect = async () => {
      const provider = new ethers.providers.JsonRpcProvider(PROVIDER)
      const base = ethers.Wallet.fromMnemonic(phrase)
      const signer = base.connect(provider)

      const faucet = new ethers.Contract(FAUCET_ADDR, FAUCET_ABI, signer)
      const free = new ethers.Contract(FREE_ADDR, ERC20_ABI, provider)
      const fmn = new ethers.Contract(FMN_ADDR, ERC20_ABI, provider)


      const fsnBal = await provider.getBalance(base.address)
      const freeBal = await free.balanceOf(base.address)
      const fmnBal = await fmn.balanceOf(base.address)

      console.log(fsnBal, freeBal, fmnBal)
    }
    connect()
  }, [ phrase ])


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
            {balances.fsn.toString()}
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FREE
          </Value>
          <Value>
            {balances.free.toString()}
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FMN
          </Value>
          <Value>
            {balances.fmn.toString()}
          </Value>
        </Row>
      </Balances>
      <Heading>
        My Bot Army
      </Heading>
    </MonitorContainer>
  )
}