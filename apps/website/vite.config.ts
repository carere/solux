import { cloudflare } from "@cloudflare/vite-plugin";
import { compile, paraglideVitePlugin } from "@inlang/paraglide-js";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/solid-start/plugin/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import { i18n } from "./i18n.config.mjs";

export default defineConfig(async () => {
  // Cloudflare inspects the Worker entry during server configuration, before
  // plugin buildStart hooks. Generate its imports before that inspection.
  await compile(i18n);
  return {
    resolve: { alias: { "@": new URL("./src", import.meta.url).pathname } },
    server: { host: "127.0.0.1", port: 5173, strictPort: true },
    preview: { host: "127.0.0.1", port: 4173, strictPort: true },
    plugins: [
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tanstackStart({ server: { entry: "server.ts" } }),
      solid({ ssr: true }),
      paraglideVitePlugin(i18n),
      tailwindcss(),
    ],
  };
});
