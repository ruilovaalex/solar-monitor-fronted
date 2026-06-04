# SolarMonitor Frontend

Frontend moderno para una plataforma de monitoreo fotovoltaico. Esta fase no incluye backend, ESP32, sensores ni comunicacion con hardware.

## Stack

- React 19 + Vite
- TypeScript
- Tailwind CSS 4
- Recharts
- SWR
- Datos mock con contrato listo para API

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Variables

Crea un `.env` desde `.env.example` si necesitas cambiar la API futura:

```bash
VITE_API_URL="/api"
VITE_USE_MOCK_DATA="true"
```

## Endpoints preparados

La capa `src/services/api.ts` simula estos endpoints:

- `GET /dashboard`
- `GET /systems`
- `GET /statistics`
- `GET /comparisons`
- `GET /users`

Cuando exista backend, cambia `VITE_USE_MOCK_DATA` a `false` y configura `VITE_API_URL`.
