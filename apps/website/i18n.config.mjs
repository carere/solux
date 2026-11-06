import { fileURLToPath } from "node:url";

// Delimoov's cookie + baseLocale strategy, shared by fresh CLI and Vite builds.
export const i18n = {
  project: fileURLToPath(new URL("./project.inlang", import.meta.url)),
  outdir: fileURLToPath(new URL("./src/paraglide", import.meta.url)),
  strategy: ["cookie", "baseLocale"],
  cookieName: "solux_locale",
  emitTsDeclarations: true,
  outputStructure: "message-modules",
  disableAsyncLocalStorage: false,
};
