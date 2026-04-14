import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import router from "./routes";
import apiSearchRoutes from "./api/routes/search";  // ✅ السطر المضاف 1

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);
app.use("/api/v1", apiSearchRoutes);  // ✅ السطر المضاف 2

// ── Static file serving in production ────────────────────────────────────────
if (process.env.NODE_ENV === "production") {
  const serveStatic = (urlBase: string, distDir: string) => {
    if (!fs.existsSync(distDir)) return;
    app.use(urlBase, express.static(distDir));
    app.get(`${urlBase === "/" ? "" : urlBase}/*`, (_req, res) => {
      const indexFile = path.join(distDir, "index.html");
      if (fs.existsSync(indexFile)) res.sendFile(indexFile);
      else res.status(404).send("Not found");
    });
  };

  // In CJS production: __dirname = <workspace>/artifacts/api-server/dist/
  // Go up three levels to reach workspace root
  const root = path.resolve(__dirname, "../../..");

  // Serve Fastamor at root
  serveStatic("/", path.join(root, "artifacts/fastamor/dist/public"));
}

export default app;