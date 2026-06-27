import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // WICHTIG: Ersetze 'currency-converter' mit deinem GitHub-Repository-Namen!
  base: '/currency-converter/',
})
