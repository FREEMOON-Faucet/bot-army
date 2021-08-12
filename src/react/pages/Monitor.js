import styled from "styled-components"

const MonitorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const Heading = styled.div`
  width: 80%;
  max-width: 600px;
  height: 25px;
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
`

export default function Monitor() {
  return (
    <MonitorContainer>
      <Heading>
        
      </Heading>
    </MonitorContainer>
  )
}