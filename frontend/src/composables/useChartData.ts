import { ref, onUnmounted } from "vue";
import { io, type Socket } from "socket.io-client";
import axios from "axios";
import { apiClient, API_BASE_URL, API_ENDPOINTS } from "../config/api";

interface CandlestickData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface LineData {
  time: number;
  value: number;
}

interface VolumeData {
  time: number;
  value: number;
}

interface ChartDataOptions {
  symbol?: string;
  interval?: string;
  limit?: number;
  autoConnect?: boolean;
}

export function useChartData(options: ChartDataOptions = {}) {
  const {
    symbol = "btcusdt",
    interval = "1h",
    limit = 1000,
    autoConnect = false,
  } = options;

  // State
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const historicalData = ref<CandlestickData[]>([]);
  const realtimeData = ref<CandlestickData | null>(null);
  const isConnected = ref(false);

  // Socket connection
  let socket: Socket | null = null;

  // Fetch historical data using apiClient
  const fetchHistoricalData = async (
    fetchSymbol: string = symbol,
    fetchInterval: string = interval,
    fetchLimit: number = limit
  ) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.get(API_ENDPOINTS.HISTORICAL, {
        params: {
          symbol: fetchSymbol.toUpperCase(),
          interval: fetchInterval,
          limit: fetchLimit,
        },
      });

      historicalData.value = response.data;
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with error status
          error.value = `Server error: ${err.response.status} - ${
            err.response.data?.error || err.response.statusText
          }`;
        } else if (err.request) {
          // Request made but no response received
          error.value = "Network error: Unable to connect to server";
        } else {
          // Something else happened
          error.value = `Request error: ${err.message}`;
        }
      } else {
        error.value =
          err instanceof Error
            ? err.message
            : "Failed to fetch historical data";
      }
      console.error("Error fetching historical data:", err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };

  // Connect to WebSocket for real-time data
  const connectWebSocket = (
    wsSymbol: string = symbol,
    wsInterval: string = interval
  ) => {
    if (socket) {
      socket.disconnect();
    }

    // Use relative URL in development to work with Vite proxy
    const socketUrl = import.meta.env.DEV ? "/" : API_BASE_URL;

    socket = io(socketUrl, {
      timeout: 10000,
      retries: 5,
      transports: ["websocket", "polling"],
      upgrade: true,
      rememberUpgrade: true,
      forceNew: true,
    });

    socket.on("connect", () => {
      isConnected.value = true;
      console.log("Connected to WebSocket");

      // Subscribe to symbol updates
      socket!.emit("subscribe", wsSymbol.toLowerCase(), wsInterval);
    });

    socket.on("disconnect", (reason) => {
      isConnected.value = false;
      console.log("Disconnected from WebSocket:", reason);

      // Auto-reconnect logic for certain disconnect reasons
      if (reason === "io server disconnect") {
        // Server initiated disconnect, try to reconnect after delay
        setTimeout(() => {
          if (!isConnected.value) {
            socket?.connect();
          }
        }, 2000);
      }
    });

    socket.on("kline", (data: CandlestickData) => {
      realtimeData.value = data;

      // Update historical data with real-time data
      if (historicalData.value.length > 0) {
        const lastCandle =
          historicalData.value[historicalData.value.length - 1];

        // If same time, update the last candle
        if (lastCandle.time === data.time) {
          historicalData.value[historicalData.value.length - 1] = data;
        } else {
          // New candle, add to the end
          historicalData.value.push(data);

          // Keep only the last 'limit' candles
          if (historicalData.value.length > limit) {
            historicalData.value.shift();
          }
        }
      }
    });

    socket.on("error", (errorMsg: string) => {
      error.value = errorMsg;
      console.error("WebSocket error:", errorMsg);
    });

    socket.on("connect_error", (err: Error) => {
      error.value = `Connection failed: ${err.message}`;
      console.error("Connection error:", err);
      isConnected.value = false;
    });

    socket.on("reconnect", (attemptNumber: number) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      error.value = null;
    });

    socket.on("reconnect_error", (err: Error) => {
      console.error("Reconnection error:", err);
      error.value = `Reconnection failed: ${err.message}`;
    });
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (socket) {
      socket.emit("unsubscribe");
      socket.disconnect();
      socket = null;
      isConnected.value = false;
    }
  };

  // Convert candlestick data to line data (using close prices)
  const getLineData = (): LineData[] => {
    return historicalData.value.map((candle) => ({
      time: candle.time,
      value: candle.close,
    }));
  };

  // Get volume data
  const getVolumeData = (): VolumeData[] => {
    return historicalData.value.map((candle) => ({
      time: candle.time,
      value: candle.volume,
    }));
  };

  // Format data for lightweight-charts (convert timestamp to string)
  const getFormattedData = (
    type: "candlestick" | "line" | "area" = "candlestick"
  ) => {
    if (type === "candlestick") {
      return historicalData.value.map((candle) => ({
        time: candle.time,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }));
    } else {
      return getLineData().map((point) => ({
        time: point.time,
        value: point.value,
      }));
    }
  };

  // Get formatted volume data
  const getFormattedVolumeData = () => {
    return getVolumeData().map((point) => ({
      time: point.time,
      value: point.value,
    }));
  };

  // Subscribe to a new symbol
  const subscribeToSymbol = async (
    newSymbol: string,
    newInterval: string = interval
  ) => {
    // Fetch historical data for new symbol
    await fetchHistoricalData(newSymbol, newInterval, limit);

    // Connect to WebSocket for real-time updates
    connectWebSocket(newSymbol, newInterval);
  };

  // Auto-connect if specified
  if (autoConnect) {
    subscribeToSymbol(symbol, interval);
  }

  // Cleanup on unmount
  onUnmounted(() => {
    disconnectWebSocket();
  });

  return {
    // State
    isLoading,
    error,
    historicalData,
    realtimeData,
    isConnected,

    // Methods
    fetchHistoricalData,
    connectWebSocket,
    disconnectWebSocket,
    subscribeToSymbol,

    // Data getters
    getLineData,
    getVolumeData,
    getFormattedData,
    getFormattedVolumeData,

    // Config
    API_BASE_URL,
  };
}
