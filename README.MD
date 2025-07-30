# NAT TradingView

A modern trading chart application built with Vue 3, TypeScript, and lightweight-charts, featuring real-time data integration with Binance API.

## Features

- **Real-time Trading Charts**: Powered by TradingView's lightweight-charts
- **Multiple Chart Types**: Line, Candlestick, and Area charts
- **Live Data**: Real-time price updates via WebSocket
- **Historical Data**: Fetch OHLCV data from Binance API
- **Volume Analysis**: Optional volume display for candlestick charts
- **Responsive Design**: Modern UI with dark/light theme support
- **Multiple Symbols**: Support for various cryptocurrency pairs
- **Multiple Timeframes**: 1m, 5m, 15m, 1h, 4h, 1d intervals

## Tech Stack

### Frontend

- Vue 3 with Composition API
- TypeScript
- Vite
- Tailwind CSS
- TradingView Lightweight Charts
- Socket.IO Client

### Backend

- Node.js
- Express.js
- TypeScript
- Socket.IO
- WebSocket (for Binance stream)
- Axios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd nat-tradingview
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install --force
   ```

4. **Configure Environment Variables**

   ```bash
   # Copy the example environment file
   cp .env.example .env

   # Edit .env if needed (default: http://localhost:3000)
   # VITE_API_BASE_URL=http://localhost:3000
   ```

### Running the Application

#### Start Backend Server

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3000`

#### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### API Endpoints

#### Historical Data

```
GET /api/historical?symbol=BTCUSDT&interval=1h&limit=500
```

**Parameters:**

- `symbol`: Trading pair (e.g., BTCUSDT, ETHUSDT)
- `interval`: Time interval (1m, 5m, 15m, 1h, 4h, 1d)
- `limit`: Number of candles (max 1000)

**Response:**

```json
[
  {
    "time": 1640995200,
    "open": 47000.0,
    "high": 47500.0,
    "low": 46500.0,
    "close": 47200.0,
    "volume": 123.45
  }
]
```

#### WebSocket Events

**Subscribe to real-time data:**

```javascript
socket.emit("subscribe", "btcusdt", "1m");
```

**Receive real-time updates:**

```javascript
socket.on("kline", (data) => {
  console.log(data); // { time, open, high, low, close }
});
```

**Unsubscribe:**

```javascript
socket.emit("unsubscribe");
```

### Project Structure

```
nat-tradingview/
├── backend/
│   ├── src/
│   │   └── server.ts          # Express server with API routes
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/
│   │   │       └── CommonChart.vue    # Chart component
│   │   ├── composables/
│   │   │   └── useChartData.ts        # Data fetching logic
│   │   ├── views/
│   │   │   └── ChartView.vue          # Main chart view
│   │   └── main.ts
│   ├── package.json
│   └── vite.config.ts
└── README.MD
```

### Usage

1. **Start both servers** (backend and frontend)
2. **Open your browser** to `http://localhost:5173`
3. **Select a symbol** from the dropdown (BTC/USDT, ETH/USDT, etc.)
4. **Choose an interval** (1m, 5m, 15m, 1h, 4h, 1d)
5. **Select chart type** (Line, Candlestick, Area)
6. **Toggle volume display** (available for candlestick charts)

### Chart Features

- **Pan and Zoom**: Mouse wheel to zoom, drag to pan
- **Crosshair**: Hover to see price and time information
- **Real-time Updates**: Live price updates via WebSocket
- **Responsive**: Automatically adjusts to container size
- **Theme Support**: Light and dark themes

### Available Symbols

- BTC/USDT
- ETH/USDT
- ADA/USDT
- DOT/USDT
- LINK/USDT
- BNB/USDT

### Development

#### Backend Development

```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

#### Frontend Development

```bash
cd frontend
npm run dev  # Starts Vite dev server
```

#### Building for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Docker Support

Build and run with Docker Compose:

```bash
docker-compose up --build
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### License

This project is licensed under the MIT License.

### Acknowledgments

- TradingView for the lightweight-charts library
- Binance for providing free API access
- Vue.js and the Vue ecosystem

---

**Note:** This application uses Binance's public API for demonstration purposes. For production use, consider implementing proper error handling, rate limiting, and authentication.
