import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import './index.css'
import App from './App.tsx'

// GitHub Pages SPA fallback: restore a deep-linked path that 404.html
// preserved via ?redirect= so clean URLs work on refresh / direct links.
const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('redirect')
if (redirectPath) {
  window.history.replaceState(null, '', redirectPath)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SmoothScroll>
        <App />
      </SmoothScroll>
    </BrowserRouter>
  </StrictMode>,
)
