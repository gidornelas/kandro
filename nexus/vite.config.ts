import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('@livekit/components-react')) return 'livekit-ui'
          if (id.includes('livekit-client') || id.includes('@livekit/protocol')) return 'livekit-core'
          if (id.includes('@livekit')) return 'livekit-shared'
          if (id.includes('@tanstack/react-query-devtools')) return 'query-devtools'
          if (id.includes('@tanstack/react-query')) return 'query'
          if (id.includes('@radix-ui')) return 'radix'
          if (id.includes('@dnd-kit')) return 'dnd-kit'
          if (id.includes('socket.io-client')) return 'socket'
          if (id.includes('react-dom') || id.includes('react/jsx-runtime') || id.includes('\\react\\') || id.includes('/react/')) return 'react-vendor'
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
