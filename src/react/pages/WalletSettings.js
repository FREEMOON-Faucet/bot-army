import { useEffect, useState } from "react"
import styled from "styled-components"
import fmn from "../../icons/android-chrome-512x512.png"


const WalletSettingsContainer = styled.div`
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

const Heading = styled.div`
  width: 80%;
  max-width: 600px;
  height: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 80%;
  margin-bottom: 20px;
  max-width: 600px;
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

const Derivations = styled.input`
  resize: none;
  width: 100%;
  max-width: 495px;
  height: 40px;
  margin: 5px;
  padding: 5px;
  border: 1px solid black;
  border-radius: 2px;
  outline: none;
  font-size: 1.5rem;
  text-align: center;
  line-height: 30px;
`

const Confirm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 495px;
  height: 100px;
  margin: 5px;
  padding: 5px;
  border: 2px solid black;
  border-radius: 4px;
  font-size: 2rem;
  cursor: pointer;
  background: rgba(146, 180, 227, 0.6);
`


export default function WalletSettings({ setMnemonic, setDerivations }) {

  const seedPhrase = () => {
    const words = []
    
    for(let i = 0; i < 12; i++) {
      words.push(<Mnemonic key={i} placeholder={i + 1} spellCheck={false}/>)
    }

    return words
  }


  return (
    <WalletSettingsContainer>
      <Brand>
        <Icon src={fmn}/>
        <Title>
          The FREEMOON Faucet
        </Title>
        <Subtitle>
          Bot Army
        </Subtitle>
      </Brand>
      <Heading>
        Bot Army Seed Phrase
      </Heading>
      <ContentContainer>
        {seedPhrase()}
      </ContentContainer>
      <Heading>
        Number of Bots
      </Heading>
      <ContentContainer>
        <Derivations type="number" min="1" placeholder="Min 1"/>
      </ContentContainer>
      <ContentContainer>
        <Confirm onClick={() => {
          setMnemonic()
          setDerivations()
        }}>
          Start
        </Confirm>
      </ContentContainer>
    </WalletSettingsContainer>)
}