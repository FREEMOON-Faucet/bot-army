import { useEffect, useState, useRef } from "react"
import styled from "styled-components"


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
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 80%;
  max-width: 600px;
  margin: 10px 0;
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

const Confirm = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 495px;
  height: 100px;
  margin: 5px;
  padding: 5px;
  border-radius: 6px;
  font-size: 2rem;
  cursor: pointer;
  background: rgb(146, 180, 227);
  box-shadow: 0px 4px 12px #ccc;
`


export default function WalletSettings({ generateWallet }) {

  const words = useRef([])


  const displayPhraseInputs = () => {
    let phraseInputs = []
    for(let i = 0; i < 12; i++) {
      phraseInputs.push(
        <Mnemonic ref={words[i]} key={i} placeholder={i + 1} spellCheck={false} onChange={e => words.current[i] = e.target.value}/>
      )
    }
    return phraseInputs
  }


  const sendWalletSettings = () => {
    const formattedPhrase = words.current.join().replaceAll(" ", "").replaceAll(",", " ")

    generateWallet(formattedPhrase)
  }


  return (
    <WalletSettingsContainer>
      <Heading>
        Bot Army Seed Phrase
      </Heading>
      <ContentContainer>
        {displayPhraseInputs()}
      </ContentContainer>
      <ContentContainer>
        <Confirm onClick={() => words.current.length === 12 ? sendWalletSettings() : ""}>
          Start
        </Confirm>
      </ContentContainer>
    </WalletSettingsContainer>
  )
}