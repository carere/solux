import { DevTools } from "./types";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: {
      connect: <S>(options?: { name: string }) => DevTools<S>;
    };
  }
}
