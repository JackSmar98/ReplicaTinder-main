    // vite.config.js
    import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      // Las configuraciones de esbuild y optimizeDeps se eliminan
      // ya que @vitejs/plugin-react debería manejar el JSX por defecto.
    })
    