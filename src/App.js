import { useState, useEffect } from "react"
import styled from "styled-components"
import GlobalStyle from "./globalStyle"

import fmn from "./icons/android-chrome-512x512.png"
import WalletSettings from "./pages/WalletSettings"
import BotCount from "./pages/BotCount"
import Monitor from "./pages/Monitor"


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
  const [ count, setCount ] = useState(0)


  useEffect(() => {
    if(connection && !count) setTab(1)
    else if(connection && count) setTab(2) 
    else setTab(0)
  }, [ connection, count ])


  const generateWallet = async wallet => {
    setConnection({
      phrase: wallet.words,
      provider: wallet.provider
    })
  }


  const displayTab = () => {
    if(tab === 0) {
      return (
        <WalletSettings generateWallet={ generateWallet }/>
      )
    } else if(tab === 1) {
      return (
        <BotCount setCount={ setCount }/>
      )
    } else if(tab === 2) {
      return (
        <Monitor connection={ connection } count={ count }/>
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
