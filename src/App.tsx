import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="container">
      <h1 className="year">2026</h1>
      <h2 className="greeting">Happy New Year</h2>
    </div>
  )
}

export default App
