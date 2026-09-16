import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import SmoothScroll from './components/SmoothScroll'
import './lib/gsapSetup'
import './index.css'
import './dala-utilities.css'
import App from './App.tsx'

// Enables progressive enhancements (reveal fallbacks, menu states) that
// only exist once JS is running — CSS hides [data-reveal] under `.js`.
document.documentElement.classList.add('js')

// Dala viewport unit: --vh tracks the real visible height so `calc(var(--vh)*N)`
// stays accurate on mobile (URL bar hide/show) — same approach as the Scrap app.
const setViewportUnit = () => {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`)
}
setViewportUnit()
window.addEventListener('resize', setViewportUnit)

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
