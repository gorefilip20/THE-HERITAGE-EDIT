/**
 * Production entry point for hosts that require a startup FILE rather than a
 * command (e.g. Hostinger hPanel → Node.js App, which runs under Passenger).
 *
 * It boots Next.js in production mode and listens on the port the host assigns
 * via process.env.PORT. Run `npm run build` first so the .next output exists.
 *
 * Locally you can still use `npm start` (next start); this file is only needed
 * where the platform launches a single JS file.
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error handling request:", err);
        res.statusCode = 500;
        res.end("Internal Server Error");
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> THE HERITAGE EDIT ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });
