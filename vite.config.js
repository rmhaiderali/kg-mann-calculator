import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { VitePWA } from "vite-plugin-pwa"
import legacy from "@vitejs/plugin-legacy"

// https://vite.dev/config/
export default defineConfig({
  base: "/kg-mann-calculator",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      manifest: {
        name: "Calculator",
        short_name: "Calculator",
        theme_color: "#131313",
        icons: [
          {
            src: "icon.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    }),
    legacy({
      targets: ["edge >= 12"],
      additionalLegacyPolyfills: ["whatwg-fetch"],
    }),
  ],
  build: {
    rolldownOptions: {
      input: ["/index.html", "/classic/index.html"],
    },
  },
})
