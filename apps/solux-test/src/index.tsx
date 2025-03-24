/* @refresh reload */
import { render } from "solid-js/web";
import "./index.css";
import { SoluxProvider } from "@carere/solux";
import App from "./App";
import { store } from "./solux";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

render(
  () => (
    <SoluxProvider store={store}>
      <App />
    </SoluxProvider>
  ),
  root,
);
