import { channels } from "../shared/constants"
import { useState, useEffect } from "react"
import styled from "styled-components"
import Web3 from "web3"
import GlobalStyle from "./globalStyle"
import Config from "../shared/config"

import fmn from "../icons/android-chrome-512x512.png"
import WalletSettings from "./pages/WalletSettings"
import Monitor from "./pages/Monitor"

const { ipcRenderer } = window

const PROVIDER = Config.mainnet.provider


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
  const [ phrase, setPhrase ] = useState("")

  useEffect(() => {
    if(phrase) setTab(1)
    else setTab(0)
  }, [ phrase ])


  const generateWallet = async (count, seedPhrase) => {
    setPhrase(seedPhrase)
  }


  const displayTab = () => {
    if(tab === 0) {
      return (
        <WalletSettings generateWallet={ generateWallet }/>
      )
    } else if(tab === 1) {
      return (
        <Monitor phrase={ phrase }/>
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
