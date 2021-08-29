import { useState } from "react"
import styled from "styled-components"


const GasContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Input = styled.input`
  width: 100%;
  max-width: 495px;
  height: 50px;
  margin: 5px 0;
  padding: 0;
  border: 1px solid black;
  border-radius: 4px;
  outline: none;
  font-size: 1.5rem;
  text-align: center;
  line-height: 30px;
`

const Heading = styled.div`
  width: 80%;
  max-width: 600px;
  height: 25px;
  margin: 20px 0 10px;
  font-size: 1.4rem;
  font-weight: bold;
  text-align: center;
`

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 98%;
  max-width: 490px;
  height: 80px;
  margin: 20px 0;
  border-radius: 4px;
  font-size: 1.4rem;
  cursor: pointer;
  background: rgb(146, 180, 227);
  box-shadow: 0px 4px 12px #ccc;
`

export default function BotCount({ setCount }) {

  const [ countValue, setCountValue ] = useState(1)


  return (
    <GasContainer>
      <Heading>
        Number of Bots
      </Heading>
      <Input type="number" min="1" defaultValue={ countValue } onChange={ e => setCountValue(e.target.value) }/>
      <Action onClick={ () => countValue > 0 ? setCount(countValue) : ""}>
        Confirm
      </Action>
    </GasContainer>
  )
}