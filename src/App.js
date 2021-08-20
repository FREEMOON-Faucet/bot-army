import { useState, useEffect } from "react"
import styled from "styled-components"
import GlobalStyle from "./globalStyle"

import fmn from "./icons/android-chrome-512x512.png"
import WalletSettings from "./pages/WalletSettings"
import Gas from "./pages/Gas"
import Monitor from "./pages/Monitor"

import Config from "./config.mjs"

const PROVIDER = Config.testnet.provider


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Brand = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 10px;
`

const Icon = styled.img`
  width: 50%;
  max-width: 80px;
`

const Title = styled.div`
  margin-top: 10px;
  font-size: 2rem;
  text-align: center;
`

const Subtitle = styled.div`
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-style: italic;
  text-align: center;
`


function App() {

  const [ tab, setTab ] = useState(0)
  const [ connection, setConnection ] = useState(null)
  const [ config, setConfig ] = useState(null)


  useEffect(() => {
    if(connection) console.log(`Connection set: ${connection.provider}, ${connection.phrase}`)
  }, [ connection ])


  useEffect(() => {
    if(config) console.log(`Config set: ${config.count}, ${config.gasPrice}`)
  }, [ config ])


  useEffect(() => {
    if(connection && !config) setTab(1)
    else if(connection && config) setTab(2) 
    else setTab(0)
  }, [ connection, config ])


  const generateWallet = async seedPhrase => {
    setConnection({
      provider: PROVIDER,
      phrase: seedPhrase
    })
  }


  const countAndGas = async options => {
    setConfig({
      count: options.count,
      gasPrice: options.gasPrice
    })
  }


  const displayTab = () => {
    if(tab === 0) {
      return (
        <WalletSettings generateWallet={ generateWallet }/>
      )
    } else if(tab === 1) {
      return (
        <Gas connection={ connection } countAndGas={ countAndGas }/>
      )
    } else if(tab === 2) {
      return (
        <Monitor connection={ connection } config={ config }/>
      )
    }
  }


  return (
    <Container>
      <GlobalStyle/>
      <Brand>
        <Icon src={ fmn }/>
        <Title>
          The FREEMOON Faucet
        </Title>
        <Subtitle>
          Bot Army
        </Subtitle>
      </Brand>
      { displayTab() }
    </Container>
  )
}


export default App
