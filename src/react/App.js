import { channels } from "../shared/constants"
import { useState } from "react"
import styled from "styled-components"
import GlobalStyle from "./globalStyle"

import WalletSettings from "./pages/WalletSettings"


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const { ipcRenderer } = window


function App() {
  
  ipcRenderer.on(channels.MNEMONIC, (event, arg) => {
    ipcRenderer.removeAllListeners(channels.MNEMONIC)
    const result = arg
    console.log(result)
  })

  ipcRenderer.send(channels.MNEMONIC)


  return (
    <Container>
      <GlobalStyle/>
      <WalletSettings/>
    </Container>
  )
}


export default App
