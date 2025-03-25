import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
    jsxInject: `import React from 'react'`,
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Use the new port
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:8080', // Use the new port
        changeOrigin: true,
        ws: true,
      },
    }
  }
})
