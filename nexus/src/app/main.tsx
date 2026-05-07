import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { queryClient } from '../core/queryClient'
import { getStoredSettingsSnapshot } from '../modules/settings/store'
import { applyThemeToDocument } from '../modules/settings/theme'
import '../styles/tokens.css'
import '../styles/globals.css'

applyThemeToDocument(getStoredSettingsSnapshot().appearance.theme)

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then(({ ReactQueryDevtools }) => ({
        default: ReactQueryDevtools,
      }))
    )
  : null

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      {ReactQueryDevtools && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>,
)

// Axe-core audit in development only
if (import.meta.env.DEV) {
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000)
  })
}
