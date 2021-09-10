import React from 'react';
import { ChakraProvider } from "@chakra-ui/react"
// import { theme } from './theme';
import Home from './Home';
import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
  styles: {
    global: {
      // styles for the `body`
      body: {
        // bg: "#679E58",
        bg: "green.500",
        color: "white",
        fontFamily: 'serif',
      },
    },
  },
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Home />
    </ChakraProvider>
  );
}

export default App;
