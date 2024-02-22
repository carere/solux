import { DevTools, DevToolsOptions } from "./types";

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: {
      connect: <S>(options?: Partial<DevToolsOptions>) => DevTools<S>;
    };
  }
}
