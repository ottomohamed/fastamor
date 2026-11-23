import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;
// Flight route pages are fully server-rendered static pages: keep their HTML.
if (!root.dataset.static) {
  createRoot(root).render(<App />);
}
