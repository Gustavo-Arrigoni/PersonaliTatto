import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve("out");
if (!fs.existsSync(path.join(root, "index.html"))) {
  console.error("Execute npm run build antes de npm start.");
  process.exit(1);
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon",
};
const server = http.createServer((req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let target = path.resolve(root, `.${pathname}`);
    if (target !== root && !target.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    if (fs.existsSync(target) && fs.statSync(target).isDirectory())
      target = path.join(target, "index.html");
    if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(path.join(root, "404.html")).pipe(res);
      return;
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(target)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    fs.createReadStream(target).pipe(res);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, "127.0.0.1", () =>
  console.log(`PersonaliTatto · http://127.0.0.1:${port}`),
);
