import app from "./app";

(async () => {
  const rawPort = process.env["PORT"];
  if (!rawPort) throw new Error("PORT environment variable is required");
  const port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) throw new Error(`Invalid PORT: "${rawPort}"`);

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
})();