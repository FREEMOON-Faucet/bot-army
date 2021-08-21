import { useState, useReducer } from "react"
import styled from "styled-components"
import { ethers } from "ethers"


const WalletSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Heading = styled.div`
  width: 80%;
  max-width: 600px;
  height: 25px;
  margin-top: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

const SubHeading = styled.div`
  width: 80%;
  max-width: 250px;
  height: 10px;
  margin-top: 5px;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
`

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 80%;
  max-width: 550px;
  margin: 10px 0;
  padding: 10px;
  border: ${ props => props.border ? "1px solid #000" : "0" };
  border-radius: 5px;
`

const Mnemonic = styled.textarea`
  resize: none;
  width: 80%;
  max-width: 150px;
  height: 30px;
  margin: 5px;
  padding: 5px;
  border: 1px solid black;
  border-radius: 2px;
  outline: none;
  font-size: 1.5rem;
  line-height: 30px;
`

const Button = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 495px;
  height: 60px;
  margin: 5px;
  padding: 5px;
  border-radius: 6px;
  font-size: 1.6rem;
  font-weight: bold;
  cursor: pointer;
  background: rgb(146, 180, 227);
  box-shadow: 0px 4px 12px #ccc;
`

const MonitorAction = styled.div`
  display: ${ props => props.active ? "flex" : "none" };
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 80%;
  max-width: 600px;
  height: 80px;
  margin: 20px 0;
  padding: 5px;
  border-radius: 5px;
  font-size: 1rem;
  background: #ddd;
  box-shadow: 0px 4px 12px #ccc;
  text-align: center;
  word-break: break-all;
`

const Text = styled.div`
  display: flex;
  width: 80%;
  max-width: 600px;
  font-size: 1.2rem;
  font-style: italic;
  text-align: center;
`


export default function WalletSettings({ generateWallet }) {

  const [ monitor, setMonitor ] = useState()
  const [ wallet, setWallet ] = useState({
    display: false,
    address: "",
    privateKey: ""
  })


  const [ words, dispatch ] = useReducer((state, action) => {
    state[action.index] = action.value
    return state
  }, [])


  const displayPhraseInputs = () => {
    let phraseInputs = []
    for(let i = 0; i < 12; i++) {
      phraseInputs.push(
        <Mnemonic key={ i } placeholder={ i + 1 } value={ words[i] } onChange={ e => dispatch({ index: i, value: e.target.value}) }/>
      )
    }
    return phraseInputs
  }


  const sendWalletSettings = () => {
    const formattedPhrase = words.join().replaceAll(" ", "").replaceAll(",", " ")

    generateWallet(formattedPhrase)
  }


  const generateNewWallet = () => {
    const newWallet = ethers.Wallet.createRandom()
    const phrase = newWallet.mnemonic.phrase.split(" ")

    for(let i = 0; i < 12; i++) {
      dispatch({ index: i, value: phrase[i] })
    }

    setWallet({
      display: true,
      address: newWallet.address,
      privateKey: newWallet.privateKey
    })
  }


  const validateMnemonic = () => {
    const phrase = words.join().replaceAll(" ", "").replaceAll(",", " ")
    return ethers.utils.isValidMnemonic(phrase)
  }


  return (
    <WalletSettingsContainer>
      <Heading>
        Bot Army Seed Phrase
      </Heading>
      <ContentContainer>
        { displayPhraseInputs() }
      </ContentContainer>
      <ContentContainer border={ true }>
        <Heading>
          Generate New Wallet
        </Heading>
        <Text>
          Your new seed phrase is not saved or stored anywhere. Please write it down somewhere to prevent losing access to your wallet.
        </Text>
        <Button onClick={ () => generateNewWallet() }>
          Generate
        </Button>
      </ContentContainer>
      <ContentContainer>
        <MonitorAction active={ Boolean(monitor) }>
          { monitor }
        </MonitorAction>
        <MonitorAction active={ wallet.display }>
          <SubHeading>Base Address</SubHeading>
          <br/>
          { wallet.address }
        </MonitorAction>
        <MonitorAction active={ wallet.display }>
          <SubHeading>Private Key (for MetaMask)</SubHeading>
          <br/>
          { wallet.privateKey }
        </MonitorAction>
        <Button onClick={() => {
          const isValid = validateMnemonic()
          if(isValid) {
            sendWalletSettings()
          } else {
            setMonitor("Invalid Seed Phrase.")
          }
        }}>
          Continue
        </Button>
      </ContentContainer>
    </WalletSettingsContainer>
  )
}