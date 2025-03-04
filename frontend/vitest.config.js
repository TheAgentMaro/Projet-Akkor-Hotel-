import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Indique l'environnement (DOM) pour simuler un navigateur
    environment: 'jsdom',

    // Le ou les fichiers de setup
    setupFiles: ['./tests/setupTests.js'],
  },
})
