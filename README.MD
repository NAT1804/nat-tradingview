# NAT TradingView

A real-time trading data viewer using Binance WebSocket, built with a Node.js/Express/Socket.IO backend and a Vue 3 + Vite frontend.

## Features

- **Backend**:

  - Node.js + Express server
  - Real-time data relay from Binance WebSocket API
  - Socket.IO for client communication

- **Frontend**:
  - Vue 3 with Vite
  - Real-time candlestick (kline) updates
  - Simple, modern UI

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Setup

#### 1. Clone the repository

```bash
git clone <your-repo-url>
cd nat-tradingview
```

#### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### 3. Run the backend server

```bash
cd backend
npm run start
# Server runs on http://localhost:3000
```

#### 4. Run the frontend

```bash
cd frontend
npm run dev
# App runs on http://localhost:5173 (default)
```

---

## Project Structure

```
nat-tradingview/
  backend/    # Express + Socket.IO server
  frontend/   # Vue 3 + Vite client
```

---

## How it Works

- The backend connects to Binance’s WebSocket API for real-time kline data.
- It relays this data to frontend clients via Socket.IO.
- The frontend subscribes to symbols and displays live candlestick data.

---

## Customization

- To change the trading symbol, modify the subscription logic in the frontend or backend as needed.

---

## License

MIT
