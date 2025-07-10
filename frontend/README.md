# NAT TradingView Frontend

A Vue 3 application with Vue Router and lightweight-charts for trading chart visualization.

## Features

- **Chart View** (`/`) - Interactive trading chart with lightweight-charts
- **Settings** (`/settings`) - Application settings and configuration
- **Reusable Chart Component** - CommonChart component for consistent chart display

## Routing

The application uses Vue Router 4 with the following routes:

- `/` - Chart View (default/root route)
- `/settings` - Settings page

## Chart Features

- Interactive price charts with crosshair
- Responsive design with customizable dimensions
- Real-time data updates support
- Professional trading chart styling
- Built with lightweight-charts library

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ChartView.vue      # Main chart view component
│   ├── CommonChart.vue    # Reusable chart component
│   ├── Navigator.vue      # Navigation component
│   └── SettingsView.vue   # Settings component
├── router/
│   └── index.ts          # Vue Router configuration
├── App.vue               # Main app component
└── main.ts              # App entry point
```

## Technologies Used

- Vue 3 with Composition API
- Vue Router 4
- TypeScript
- Tailwind CSS
- Vite
- lightweight-charts
