# UrbanPath AI

A 3D city routing app that plans a route across Manhattan while weighing travel time, safety and
expected congestion. Built with Next.js and React Three Fiber.

## What it does

- **Routing:** Dijkstra over a Manhattan street grid, with each edge weighted by distance and live
  traffic. Turning on *safety priority* adds each node's crime rate to the weight, so the route
  bends away from hotspots ([`pathfinding.ts`](src/lib/algorithms/pathfinding.ts)).
- **Safety score:** a 0–100 score for the chosen route from the crime rate along its path and the
  number of hotspots nearby ([`safety.ts`](src/lib/algorithms/safety.ts)).
- **Congestion forecast:** a weekday/weekend time-of-day profile projected to +15, +30 and +60
  minutes, with a "leave now or wait" recommendation ([`traffic.ts`](src/lib/algorithms/traffic.ts)).
- **3D view:** the city, the animated route, a safety heat map and simulated traffic, rendered with
  instanced meshes so the whole grid stays smooth ([`src/components/scene`](src/components/scene)).

Routing, safety and traffic run as three separate modules that the UI presents as agents. The crime
hotspots and traffic profile are generated in [`nycData.ts`](src/lib/data/nycData.ts) for the demo;
they are not real city data.

## Demo locations

Times Square · Central Park · Empire State Building · Grand Central · Wall Street · Union Square

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
```

Or with Docker:

```bash
docker build -t urbanpath .
docker run -p 3000:3000 urbanpath
```

## Stack

Next.js 15 · React 19 · TypeScript · React Three Fiber + Drei · Three.js · Zustand · Tailwind CSS

## License

MIT
