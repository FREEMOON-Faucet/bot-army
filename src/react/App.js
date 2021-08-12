import { channels } from "../shared/constants"
import { useState, useEffect } from "react"
import styled from "styled-components"
import GlobalStyle from "./globalStyle"

import fmn from "../icons/android-chrome-512x512.png"
import WalletSettings from "./pages/WalletSettings"
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

const { ipcRenderer } = window


function App() {

  const [ mnemonic, setMnemonic ] = useState([])
  const [ derivations, setDerivations ] = useState([])

  const [ tab, setTab ] = useState(0)

  useEffect(() => {
    if(mnemonic.length && derivations.length) setTab(1)
    else setTab(0)
  }, [ mnemonic, derivations ])
  
  // ipcRenderer.on(channels.MNEMONIC, (event, arg) => {
  //   ipcRenderer.removeAllListeners(channels.MNEMONIC)
  //   const result = arg
  //   console.log(result)
  // })

  // ipcRenderer.send(channels.MNEMONIC)


  const displayTab = () => {
    if(tab === 0) {
      return (
        <WalletSettings setWalletSettings={settings => {
          setMnemonic(settings.formattedPhrase)
          setDerivations(settings.formattedCount)
        }}/>
      )
    } else if(tab === 1) {
      return (
        <Monitor/>
      )
    }
  }


  return (
    <Container>
      <GlobalStyle/>
      <Brand>
        <Icon src={fmn}/>
        <Title>
          The FREEMOON Faucet
        </Title>
        <Subtitle>
          Bot Army
        </Subtitle>
      </Brand>
      {displayTab()}
    </Container>
  )
}


export default App
