import { defineConfig, type Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetPlugin(): Plugin {
  return {
    name: 'figma-asset-resolver',
    transformIndexHtml(html) {
      return html.replace(/figma:asset\//g, '/assets/')
    },
    transform(code, id) {
      if (/\.(tsx?|jsx?)$/.test(id) && code.includes('figma:asset/')) {
        return code.replace(/figma:asset\//g, '/assets/')
      }
      return null
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
