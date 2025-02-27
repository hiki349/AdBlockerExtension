import { createServer } from "http";

const server = createServer((req, res) => {
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
