import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    // Los tests no deben depender del .env de quien los ejecuta: la URL de la API se fija
    // aqui y MSW intercepta las peticiones a ese origen.
    env: { VITE_API_URL: 'http://api.test' },
  },
})
