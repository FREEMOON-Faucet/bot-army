import { createGlobalStyle } from "styled-components"

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    font-size: 12px;
    font-family: sans-serif;
    color: #000;
    ::-webkit-scrollbar {
      display: none;
    }
  }
`

export default GlobalStyle