import { StrictMode } from 'react'

window.API_BASE_URL = import.meta.env.VITE_API_URL || "https://react-ecommerce-backend-fvc6.onrender.com";

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
