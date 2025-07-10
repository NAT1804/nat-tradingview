import express from "express";
import http from "http";
import { Server } from "socket.io";
import WebSocket from "ws";
import axios from "axios";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Enable CORS and JSON parsing
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Historical data endpoint
app.get("/api/historical", async (req, res) => {
  try {
    const {
      symbol = "btcusdt",
      interval = "1h",
      limit = 1000, // Max 1000 candles
    } = req.query;

    const response = await axios.get("https://api.binance.com/api/v3/klines", {
      params: {
        symbol: symbol.toString().toUpperCase(),
        interval: interval.toString(),
        limit: parseInt(limit.toString()),
      },
    });

    const formattedData = response.data.map((k: any) => ({
      time: k[0] / 1000, // Convert to seconds for lightweight-charts
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

// WebSocket connection handling
io.on("connection", (socket) => {
  let binanceWS: WebSocket | null = null;

  socket.on("subscribe", (symbol: string, interval = "1m") => {
    // Close existing connection if any
    if (binanceWS) {
      binanceWS.close();
    }

    const url = `wss://stream.binance.com:9443/ws/${symbol}@kline_${interval}`;
    binanceWS = new WebSocket(url);

    binanceWS.on("message", (msg) => {
      const { k } = JSON.parse(msg.toString());
      socket.emit("kline", {
        time: k.t / 1000,
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
      });
    });

    binanceWS.on("error", (error) => {
      console.error("WebSocket error:", error);
      socket.emit("error", "WebSocket connection error");
    });
  });

  socket.on("unsubscribe", () => {
    if (binanceWS) {
      binanceWS.close();
      binanceWS = null;
    }
  });

  socket.on("disconnect", () => {
    if (binanceWS) {
      binanceWS.close();
      binanceWS = null;
    }
  });
});

server.listen(3000, () => console.log("Backend running on :3000"));
