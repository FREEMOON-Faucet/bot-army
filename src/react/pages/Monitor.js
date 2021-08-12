import { useEffect, useState } from "react"
import { channels } from "../shared/constants"
import styled from "styled-components"
import BigNumber from "bignumber.js"

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

export default function Monitor({ web3 }) {

  const ZERO = new BigNumber("0")

  const [ balances, setBalances ] = useState({
    fsn: ZERO,
    free: ZERO,
    fmn: ZERO
  })

  useEffect(() => {
    const getBalances = async () => {
      const [ acc ] = await web3.eth.accounts.wallet.load("test#!$")
      const fsnBal = web3.utils.fromWei(await web3.eth.getBalance(acc))
    }
  })

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
            12
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FREE
          </Value>
          <Value>
            23
          </Value>
        </Row>
        <Row>
          <Value symbol={true}>
            FMN
          </Value>
          <Value>
            34
          </Value>
        </Row>
      </Balances>
      <Heading>
        My Bot Army
      </Heading>
    </MonitorContainer>
  )
}