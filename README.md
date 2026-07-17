# SolarMonitor Frontend

Interfaz React para consultar datos fotovoltaicos reales almacenados por el backend en PostgreSQL.

## Stack

- React 19 y TypeScript.
- Vite.
- Tailwind CSS 4.
- SWR.
- Recharts.
- JWT mediante el backend.

## Arranque

```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

El proxy de Vite utiliza `/api`. Puede personalizarse con:

```env
VITE_API_URL="/api"
```

## Pantallas

- Login sin credenciales visibles o precargadas.
- Dashboard con generacion, consumo, balance y ultima lectura.
- Seleccion de rango: hoy, 24 horas, 7 dias y 30 dias.
- Granularidad: minutos, horas, dias y meses.
- Grafico de area o barras y reporte PDF.
- Registro de ESP32 y Raspberry Pi.
- Monitoreo, configuracion e historicos.
- Administracion de usuarios para el rol administrador.
- Meteorologia como vista futura sin backend funcional.

## Endpoints consumidos

- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/statistics`
- `GET /api/devices`
- `POST /api/devices`
- `GET /api/realtime/devices`
- `GET /api/history/devices`
- `GET /api/monitoring/config`
- `PUT /api/monitoring/config`
- `GET|POST /api/users`
- `DELETE /api/users/:id`

## Dispositivos

ESP32 y Raspberry Pi son fuentes configurables. Cualquiera puede enviar generacion, consumo o ambos. Al registrar un dispositivo, la clave de ingesta se muestra una sola vez y debe conservarse de forma segura.

Cada dispositivo pertenece a la cuenta que lo registra. Las cuentas nuevas muestran dashboard, dispositivos, historicos y estadisticas vacios hasta recibir sus propias lecturas. La configuracion de monitoreo tambien es independiente por usuario.

## Verificacion

```bash
npm run lint
npm run build
```

No existen datos simulados en la interfaz. Las metricas visibles provienen de los endpoints del backend.
