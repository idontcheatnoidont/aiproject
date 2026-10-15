import express from "express";
import path from "path";
import { spawn } from "child_process";
import { createServer as createViteServer } from "vite";

const PORT = 3000;
const PYTHON_PORT = 5000;

// Start Python backend server process
console.log("Launching Python 3 backend process...");
const pythonProcess = spawn("python3", ["server.py"], {
  cwd: process.cwd(),
  stdio: "inherit",
});

pythonProcess.on("error", (err) => {
  console.error("Failed to start Python backend process:", err);
});

pythonProcess.on("exit", (code, signal) => {
  console.warn(`Python process exited with code ${code} and signal ${signal}`);
});

async function startServer() {
  const app = express();

  app.use(express.json());

  // Proxy API requests to Python HTTP server
  app.use("/api", async (req, res) => {
    const targetUrl = `http://127.0.0.1:${PYTHON_PORT}/api${req.url}`;
    try {
      const options: RequestInit = {
        method: req.method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
        options.body = JSON.stringify(req.body);
      }

      const pythonRes = await fetch(targetUrl, options);
      const data = await pythonRes.text();

      res.status(pythonRes.status);
      res.setHeader("Content-Type", pythonRes.headers.get("content-type") || "application/json");
      res.send(data);
    } catch (error) {
      console.error(`Error proxying request to Python backend (${targetUrl}):`, error);
      res.status(502).json({
        error: "Python backend unreachable",
        details: String(error),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
    console.log(`Connecting to Python 3 backend at http://127.0.0.1:${PYTHON_PORT}`);
  });
}

// Clean up Python process on server shutdown
process.on("SIGINT", () => {
  pythonProcess.kill("SIGINT");
  process.exit();
});

process.on("SIGTERM", () => {
  pythonProcess.kill("SIGTERM");
  process.exit();
});

startServer();
