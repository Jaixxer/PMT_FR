import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter as Router} from 'react-router'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
    <AuthProvider>
      <App/>
    </AuthProvider>
    </Router>
  </StrictMode>
)
