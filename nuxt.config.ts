import pkg from "./package.json";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  experimental: {
    appManifest: false,
  },
  debug: false,
  ssr: true,
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      APP_VERSION: pkg.version,
      APP_NAME: pkg.name,
      APP_MODE: process.env?.NODE_ENV,
    },
  },

  modules: [
    "@pinia/nuxt",
    "@nuxt/fonts",
    "@vueuse/nuxt",
    "@nuxtjs/tailwindcss",
    "nuxt-nodemailer",
  ],

  css: ["@/assets/scss/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "./assets/scss/_vars.scss" as *;
            @use "./assets/scss/_mixins.scss" as *;
          `,
        },
      },
    },
  },
  plugins: ["~/plugins/vue3-toastify.client.ts", "~/plugins/lodash.client.ts"],
  fonts: {
    families: [{ name: "montserrat", provider: "google" }],
  },
  build: {
    transpile: ["nuxt"],
  },

  sourcemap: {
    client: false,
    server: false,
  },

  compatibilityDate: "2025-03-16",
});
