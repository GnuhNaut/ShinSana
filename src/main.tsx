import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ErrorBoundary } from './app/ErrorBoundary'
import { loadWeddingRuntime } from './config/weddingRuntime'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/sections.css'
import './styles/ornaments.css'
import './styles/motion.css'

async function bootstrap() {
  const runtime = await loadWeddingRuntime(window.location.search)
  ReactDOM.createRoot(document.getElementById('app')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App config={runtime.config} demoMode={runtime.demoMode} />
      </ErrorBoundary>
    </React.StrictMode>,
  )
}

void bootstrap()
