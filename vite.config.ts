import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        readme: resolve(__dirname, 'README.html'),
      },
    },
  },
})