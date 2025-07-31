import express from "express";
import http from "http";
import { Server } from "socket.io";
import WebSocket from "ws";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "";
const BINANCE_WS_URL = process.env.BINANCE_WS_URL;
const BINANCE_REST_URL = process.env.BINANCE_REST_URL;
const WS_HANDSHAKE_TIMEOUT = parseInt(
  process.env.WS_HANDSHAKE_TIMEOUT || "10000"
);
const WS_RECONNECT_DELAY = parseInt(process.env.WS_RECONNECT_DELAY || "5000");
const WS_MAX_RECONNECT_ATTEMPTS = parseInt(
  process.env.WS_MAX_RECONNECT_ATTEMPTS || "5"
);
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const ENABLE_DEBUG_LOGS = process.env.ENABLE_DEBUG_LOGS === "true";

// Parse CORS origins
const corsOrigins = CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const io = new Server(server, {
  cors: {
    origin: corsOrigins.length > 0 ? corsOrigins : true,
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// CORS middleware for Express app
app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Check if the origin is allowed
  if (origin && corsOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (NODE_ENV === "development") {
    // In development, allow all origins
    res.header("Access-Control-Allow-Origin", "*");
  } else if (corsOrigins.length === 0) {
    // If no CORS origins specified, allow all (fallback)
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get("/api/historical", async (req, res) => {
  try {
    const {
      symbol = "btcusdt",
      interval = "1h",
      limit = 1000, // Max 1000 candles
    } = req.query;

    const response = await axios.get(`${BINANCE_REST_URL}/klines`, {
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

io.on("connection", (socket) => {
  if (ENABLE_DEBUG_LOGS) {
    console.log("Client connected:", socket.id);
  }
  let binanceWS: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let currentSymbol = "";
  let currentInterval = "1m";
  let isConnecting = false;
  let reconnectAttempts = 0;

  const connectToBinance = (symbol: string, interval: string) => {
    if (isConnecting) {
      if (ENABLE_DEBUG_LOGS) {
        console.log("Already connecting to Binance, skipping...");
      }
      return;
    }

    isConnecting = true;
    currentSymbol = symbol;
    currentInterval = interval;

    if (binanceWS) {
      binanceWS.removeAllListeners();
      binanceWS.close();
      binanceWS = null;
    }

    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    const url = `${BINANCE_WS_URL}/${symbol}@kline_${interval}`;
    if (ENABLE_DEBUG_LOGS) {
      console.log(`Connecting to Binance WebSocket: ${url}`);
    }

    try {
      binanceWS = new WebSocket(url, {
        handshakeTimeout: WS_HANDSHAKE_TIMEOUT,
        perMessageDeflate: false, // Disable compression for better performance
      });

      binanceWS.on("open", () => {
        if (ENABLE_DEBUG_LOGS) {
          console.log(`Binance WebSocket connected for ${symbol}@${interval}`);
        }
        isConnecting = false;
        reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        socket.emit("connected", { symbol, interval });
      });

      binanceWS.on("message", (msg) => {
        try {
          const data = JSON.parse(msg.toString());
          if (data.k) {
            const { k } = data;
            socket.emit("kline", {
              time: k.t / 1000,
              open: parseFloat(k.o),
              high: parseFloat(k.h),
              low: parseFloat(k.l),
              close: parseFloat(k.c),
              volume: parseFloat(k.v),
            });
          }
        } catch (error) {
          console.error("Error parsing Binance WebSocket message:", error);
        }
      });

      binanceWS.on("error", (error) => {
        console.error("Binance WebSocket error:", error);
        isConnecting = false;
        socket.emit("error", "Real-time data connection error");

        // Attempt to reconnect after a delay
        if (
          currentSymbol &&
          currentInterval &&
          reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttempts++;
          reconnectTimer = setTimeout(() => {
            if (ENABLE_DEBUG_LOGS) {
              console.log(
                `Attempting to reconnect to ${currentSymbol}@${currentInterval}... (Attempt ${reconnectAttempts}/${WS_MAX_RECONNECT_ATTEMPTS})`
              );
            }
            connectToBinance(currentSymbol, currentInterval);
          }, WS_RECONNECT_DELAY);
        } else if (reconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) {
          console.error(
            `Max reconnection attempts (${WS_MAX_RECONNECT_ATTEMPTS}) reached for ${currentSymbol}@${currentInterval}`
          );
          socket.emit("error", "Max reconnection attempts reached");
        }
      });

      binanceWS.on("close", (code, reason) => {
        if (ENABLE_DEBUG_LOGS) {
          console.log(`Binance WebSocket closed: ${code} ${reason}`);
        }
        isConnecting = false;
        binanceWS = null;

        // Attempt to reconnect if this wasn't a manual close
        if (
          code !== 1000 &&
          currentSymbol &&
          currentInterval &&
          reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttempts++;
          reconnectTimer = setTimeout(() => {
            if (ENABLE_DEBUG_LOGS) {
              console.log(
                `Attempting to reconnect to ${currentSymbol}@${currentInterval}... (Attempt ${reconnectAttempts}/${WS_MAX_RECONNECT_ATTEMPTS})`
              );
            }
            connectToBinance(currentSymbol, currentInterval);
          }, WS_RECONNECT_DELAY);
        } else if (reconnectAttempts >= WS_MAX_RECONNECT_ATTEMPTS) {
          console.error(
            `Max reconnection attempts (${WS_MAX_RECONNECT_ATTEMPTS}) reached for ${currentSymbol}@${currentInterval}`
          );
          socket.emit("error", "Max reconnection attempts reached");
        }
      });

      binanceWS.on("ping", () => {
        if (binanceWS && binanceWS.readyState === WebSocket.OPEN) {
          binanceWS.pong();
        }
      });
    } catch (error) {
      console.error("Error creating Binance WebSocket:", error);
      isConnecting = false;
      socket.emit("error", "Failed to establish real-time data connection");
    }
  };

  socket.on("subscribe", (symbol: string, interval = "1m") => {
    if (ENABLE_DEBUG_LOGS) {
      console.log(
        `Subscribing to ${symbol} ${interval} for client ${socket.id}`
      );
    }

    // Validate symbol format
    const cleanSymbol = symbol.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!cleanSymbol) {
      socket.emit("error", "Invalid symbol format");
      return;
    }

    reconnectAttempts = 0; // Reset reconnect attempts for new subscription
    connectToBinance(cleanSymbol, interval);
  });

  socket.on("unsubscribe", () => {
    if (ENABLE_DEBUG_LOGS) {
      console.log(`Unsubscribing client ${socket.id}`);
    }

    // Clear reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    // Clear current subscription
    currentSymbol = "";
    currentInterval = "";
    reconnectAttempts = 0;

    if (binanceWS) {
      binanceWS.removeAllListeners();
      binanceWS.close(1000, "Client unsubscribed");
      binanceWS = null;
    }

    socket.emit("unsubscribed");
  });

  socket.on("disconnect", (reason) => {
    if (ENABLE_DEBUG_LOGS) {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    }

    // Clear reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    if (binanceWS) {
      binanceWS.removeAllListeners();
      binanceWS.close(1000, "Client disconnected");
      binanceWS = null;
    }
  });

  socket.on("error", (error) => {
    console.error("Socket.IO error:", error);
  });
});

server.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} in ${NODE_ENV} mode`);
  console.log(`CORS origins: ${corsOrigins.join(", ")}`);
  if (ENABLE_DEBUG_LOGS) {
    console.log(`Debug logs enabled`);
  }
});
