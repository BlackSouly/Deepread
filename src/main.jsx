import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { initializeSeedData } from './services/seedData.js'
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx'
import { ToastProvider } from './components/common/ToastProvider.jsx'

initializeSeedData()

const bootStatus = document.getElementById('boot-status')
if (bootStatus) bootStatus.remove()

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)
