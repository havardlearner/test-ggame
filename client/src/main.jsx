import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { GameProvider } from './contexts/GameContext.jsx'
import { ChatProvider } from './contexts/ChatProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <GameProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </GameProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
