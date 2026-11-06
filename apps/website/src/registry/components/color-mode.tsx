// Adapted from Zaidan color-mode.tsx (MIT); see ../../../ZAIDAN-NOTICE.md.
import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  type ParentProps,
  useContext,
} from "solid-js";

type ColorMode = "light" | "dark";
const COLOR_MODE_COOKIE_KEY = "solux-theme";
type Preference = ColorMode | "system";
type ColorModeContextValue = {
  colorMode: Accessor<ColorMode>;
  toggleColorMode: () => void;
  useSystem: () => void;
};
const ColorModeContext = createContext<ColorModeContextValue>();

export const colorModeScript = `(() => { try {
 const cookie = document.cookie.split('; ').find(v => v.startsWith('solux-theme='))?.split('=')[1];
 const stored = cookie || localStorage.getItem('solux-theme');
 const mode = stored === 'dark' || (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
 document.documentElement.classList.remove('light', 'dark');
 document.documentElement.classList.add(mode);
 document.documentElement.dataset.theme = mode;
} catch {} })()`;

export function ColorModeProvider(props: ParentProps<{ initialColorMode: ColorMode }>) {
  const [colorMode, setColorMode] = createSignal(props.initialColorMode);
  const [preference, setPreference] = createSignal<Preference>("system");
  const [systemDark, setSystemDark] = createSignal(false);
  onMount(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    const change = () => setSystemDark(media.matches);
    media.addEventListener("change", change);
    onCleanup(() => media.removeEventListener("change", change));
    try {
      const cookie = document.cookie
        .split("; ")
        .find((v) => v.startsWith(`${COLOR_MODE_COOKIE_KEY}=`))
        ?.split("=")[1];
      const stored = cookie || localStorage.getItem(COLOR_MODE_COOKIE_KEY);
      if (stored === "dark" || stored === "light") setPreference(stored);
    } catch {
      /* System preference remains available when storage is blocked. */
    }
  });
  createEffect(() => {
    const mode =
      preference() === "system" ? (systemDark() ? "dark" : "light") : (preference() as ColorMode);
    setColorMode(mode);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(mode);
    document.documentElement.dataset.theme = mode;
  });
  const persist = (mode: Preference) => {
    setPreference(mode);
    // biome-ignore lint/suspicious/noDocumentCookie: A user-selected theme cookie is shared with the next document.
    document.cookie = `${COLOR_MODE_COOKIE_KEY}=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    try {
      localStorage.setItem(COLOR_MODE_COOKIE_KEY, mode);
    } catch {
      /* Session remains usable. */
    }
  };
  return (
    <ColorModeContext.Provider
      value={{
        colorMode,
        toggleColorMode: () => persist(colorMode() === "dark" ? "light" : "dark"),
        useSystem: () => persist("system"),
      }}
    >
      {props.children}
    </ColorModeContext.Provider>
  );
}
export function useColorMode() {
  const value = useContext(ColorModeContext);
  if (!value) throw new Error("useColorMode must be used within a ColorModeProvider");
  return value;
}
