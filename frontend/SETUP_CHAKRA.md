# Setting Up Chakra UI

## Installation

```bash
cd frontend
npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

## Setup

### 1. Update `src/main.jsx`

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
```

### 2. Update `src/App.jsx`

```jsx
import { Box, Container, Heading, Input, Button, VStack } from '@chakra-ui/react'

function App() {
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={4}>
        <Heading>URL Shortener</Heading>
        <Input placeholder="Enter URL" />
        <Button colorScheme="blue">Shorten URL</Button>
      </VStack>
    </Container>
  )
}

export default App
```

## Usage Example

```jsx
import {
  Box,
  Button,
  Input,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  useToast
} from '@chakra-ui/react'

function URLShortener() {
  const toast = useToast()

  const handleShorten = () => {
    toast({
      title: 'URL shortened!',
      status: 'success',
      duration: 3000,
    })
  }

  return (
    <Card>
      <CardBody>
        <VStack spacing={4}>
          <Input placeholder="Enter URL" />
          <Button onClick={handleShorten} colorScheme="blue">
            Shorten
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
```

## Features

- ✅ Built-in form validation
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Accessible components
- ✅ Great TypeScript support

