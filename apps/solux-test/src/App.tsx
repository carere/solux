import viteLogo from "/vite.svg";
import solidLogo from "./assets/solid.svg";
import "./App.css";
import { useSolux } from "@carere/solux";
import type { RootState } from "./solux";
import { incrementMagic } from "./solux/events";

function App() {
  const { state, dispatch } = useSolux<RootState>();

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://solidjs.com" target="_blank" rel="noreferrer">
          <img src={solidLogo} class="logo solid" alt="Solid logo" />
        </a>
      </div>
      <h1>Vite + Solid</h1>
      <div class="card">
        <button type="button" onClick={() => dispatch(incrementMagic(1))}>
          count is {state.magic}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p class="read-the-docs">Click on the Vite and Solid logos to learn more</p>
    </>
  );
}

export default App;
