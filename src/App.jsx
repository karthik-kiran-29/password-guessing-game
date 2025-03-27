import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PasswordGuessingGame from './PasswordGuessingGame'

function App() {
  const [count, setCount] = useState(0)

  return (
    <PasswordGuessingGame/>
  )
}

export default App
