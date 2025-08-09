import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import Login from './frontend/screens/login.tsx'
import { BrowserRouter } from 'react-router-dom'
import BackendRoutes from './backend/routes.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <BackendRoutes></BackendRoutes>
    </BrowserRouter>
  </StrictMode>,
)
