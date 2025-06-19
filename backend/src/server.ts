import express from "express";
import http from "http";
import { Server } from "socket.io";
import WebSocket from "ws";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.on("subscribe", (symbol: string) => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol}@kline_1m`
    );
    ws.on("message", (msg: any) => {
      const json = JSON.parse(msg.toString());
      const k = json.k;
      socket.emit("kline", {
        time: k.t / 1000,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      });
    });
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
