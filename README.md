# UrbanPath AI - Smart Mobility Intelligence System

An AI-powered micro-solution for urban mobility with 3D visualization.

## Features

- **Route Optimization** - AI-powered routing using Dijkstra algorithm with traffic awareness
- **Safety Alerts** - Real-time safety scoring based on crime data and KNN
- **Congestion Prediction** - Traffic forecast for next 15/30/60 minutes
- **3D Visualization** - Interactive React Three Fiber city with animated routes

## Tech Stack

- Next.js 15 + React 19
- React Three Fiber + Drei (3D)
- Zustand (State Management)
- TypeScript
- TailwindCSS

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Open the app in your browser
2. Select origin and destination from dropdown
3. Toggle safety priority for safer routes
4. View crime hotspots on the 3D map
5. See route analytics in real-time

## Demo Locations

- Times Square
- Central Park  
- Empire State Building
- Grand Central
- Wall Street
- Union Square

## Architecture

```
┌─────────────────────────────────────┐
│           UI Layer                  │
│  RoutePanel + ResultsPanel + Dashboard│
├─────────────────────────────────────┤
│         AI Agents                   │
│  RouteAgent + SafetyAgent + Traffic │
├─────────────────────────────────────┤
│       Data Layer                   │
│  Manhattan Grid + Crime Data       │
├─────────────────────────────────────┤
│     3D Visualization              │
│  City + Heatmap + Routes          │
└─────────────────────────────────────┘
```

## License

MIT