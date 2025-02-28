import { createServer } from "http";
import { readFile } from "fs";

const server = createServer((req, res) => {
  if (req.url === "/script.js") {
    const filePath = "script.js";
    readFile(filePath, "utf8", (err, data) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error: unable to read file.");
      } else {
        res.writeHead(200, {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        res.end(data);
      }
    });
    return;
  }

  if (req.url === "/custom-list") {
    res.setHeader("Content-Type", "application/json");

    const data = {
      "tortino.com.ua": "https://c413-195-238-117-76.ngrok-free.app/script.js",
    };
    res.end(JSON.stringify(data));

    return;
  }

  res.setHeader("Content-Type", "application/json");

  const data = [
    {
      id: 11,
      priority: 1,
      action: { type: "block" },
      condition: { urlFilter: "*://pagead2.googlesyndication.com/*" },
    },
  ];

  res.end(JSON.stringify(data));
});

server.listen(3000, () => {});
