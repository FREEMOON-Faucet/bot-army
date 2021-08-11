import { channels } from "../shared/constants"
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
  return (
    <Container>
      <GlobalStyle/>
      <WalletSettings/>
    </Container>
  )
}


export default App
