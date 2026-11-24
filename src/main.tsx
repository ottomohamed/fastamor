import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const root = document.getElementById("root")!;
// Flight route pages are fully server-rendered static pages: keep their HTML.
if (!root.dataset.static) {
  // App removes the loader (data-ssr) after its first commit; see App.tsx.
  createRoot(root).render(<App />);
}
