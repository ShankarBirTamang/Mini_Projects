import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LotteryApp from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LotteryApp />
  </StrictMode>,
)
