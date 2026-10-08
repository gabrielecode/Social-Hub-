import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import generateSocialContentHandler from "./api/generate-social-content";
import metaResearchHandler from "./api/meta-research";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Abilita il parsing del corpo delle richieste in JSON
  app.use(express.json({ limit: "20mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/meta-research", (req, res) => {
    metaResearchHandler(req, res);
  });

  app.post("/api/generate-social-content", (req, res) => {
    generateSocialContentHandler(req, res);
  });

  // Setup del middleware Vite o dei file statici di produzione
  if (process.env.NODE_ENV !== "production") {
    console.log("Inizializzazione di Vite in modalità middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Inizializzazione di Express per la produzione (dist static paths)...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Errore fatale nell'avvio del server Express:", err);
});
