import "@/stores/themeStore"; // FIRST import — module-level theme apply prevents dark FOUC
import { render } from "solid-js/web";
import "./index.css";
import App from "./App";

render(() => <App />, document.getElementById("root")!);
