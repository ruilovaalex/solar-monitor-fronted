# SolarMonitor

## Manual principal vivo

SolarMonitor es una plataforma web universitaria para monitorear sistemas fotovoltaicos. Recibe lecturas desde monitores basados en ESP32 o Raspberry Pi y presenta generacion, consumo, balance e historicos de manera clara para operadores sin conocimientos tecnicos avanzados.

Este archivo conserva el contexto funcional, tecnico y operativo confirmado del proyecto. Servira como fuente para redactar el manual final A4 en PDF y debe actualizarse cuando cambien las funciones reales de la aplicacion.

> Estado del documento: manual en construccion. No contiene contrasenas, claves privadas ni datos personales reales.

## 1. Objetivo

Permitir que una persona pueda:

1. Iniciar sesion de forma segura.
2. Registrar un monitor solar.
3. Conectar un ESP32 o Raspberry Pi.
4. Recibir datos de generacion, consumo o ambos.
5. Consultar valores actuales, comparaciones e historicos.
6. Descargar un reporte del periodo seleccionado.

La prioridad es mantener una experiencia sencilla, estable y facil de explicar en un proyecto de titulacion.

## 2. Alcance actual

### Implementado

- Frontend React, TypeScript, Vite y Tailwind CSS 4.
- Backend Node.js, Express, Prisma y PostgreSQL local.
- Login con JWT y autorizacion RBAC.
- Creacion y eliminacion de usuarios por administrador.
- Registro de monitores ESP32 y Raspberry Pi.
- Fuentes configurables: generacion, consumo o bidireccional.
- Ingesta HTTP autenticada mediante `x-device-key`.
- Guardado atomico de payloads con generacion y consumo.
- Lecturas originales, valores actuales e historicos.
- Promedio movil y deteccion de cambios significativos.
- Resumenes agregados por hora, dia y mes.
- Dashboard con rangos y granularidades temporales.
- Graficos de area y barras.
- Reporte PDF del rango visualizado.
- Configuracion de monitoreo independiente por usuario.
- Estados de carga, error y ausencia de datos.
- Estacion meteorologica visible solo como funcion futura.

### No implementado

- Formulas oficiales de energia entregadas por el equipo academico.
- MQTT, WebSocket y TCP.
- Estacion meteorologica funcional.
- Aplicacion movil nativa.
- Despliegue publico definitivo.

Las funciones pendientes no deben describirse como disponibles en el manual final.

## 3. Usuarios previstos

### Administrador

Responsable de administrar las cuentas de acceso.

- Consultar usuarios registrados.
- Crear usuarios operativos.
- Eliminar usuarios.
- No puede eliminar su propia cuenta activa.
- No utiliza el panel administrativo para modificar lecturas.

### Usuario operativo

Responsable del monitoreo cotidiano.

- Consultar el dashboard.
- Registrar dispositivos.
- Copiar las credenciales de un dispositivo al crearlo.
- Consultar monitoreo e historicos.
- Modificar su propia configuracion de monitoreo.
- Descargar reportes.

Los roles validos son `admin` y `user`. Un rol desconocido no recibe acceso a vistas protegidas.

## 4. Regla fundamental de dispositivos

El tipo de hardware no determina el dato medido:

- Un ESP32 puede enviar generacion, consumo o ambos.
- Una Raspberry Pi puede enviar generacion, consumo o ambos.
- La fuente depende de la configuracion del monitor y de los sensores conectados.
- No se debe asumir que ESP32 genera y Raspberry Pi consume.

Fuentes disponibles:

| Fuente | Uso |
| --- | --- |
| `GENERATION` | El dispositivo envia generacion. |
| `CONSUMPTION` | El dispositivo envia consumo. |
| `BIDIRECTIONAL` | El dispositivo envia ambos tipos. |

## 5. Arquitectura general

```text
ESP32 o Raspberry Pi
        |
        | HTTP + x-device-key
        v
Backend Express
        |
        | Prisma
        v
PostgreSQL local
        ^
        | API REST + JWT
        |
Frontend React
```

Responsabilidades:

- El dispositivo mide y envia lecturas.
- El backend valida, procesa y almacena.
- PostgreSQL conserva usuarios, dispositivos y datos energeticos.
- Cada dispositivo pertenece al usuario que lo registra.
- Las lecturas, historicos y resumenes se aislan mediante ese propietario.
- El frontend consulta la API y presenta la informacion.
- La logica de negocio no depende de que el emisor sea ESP32 o Raspberry Pi.

## 6. Estructura del proyecto

```text
proyecto solar monitor/
  backend solar monitor/
    docs/
    prisma/
      migrations/
      schema.prisma
    scripts/
    src/
      config/
      modules/
      shared/
    tests/
  solarmonitor Fronted/
    src/
      assets/
      components/
      context/
      hooks/
      layouts/
      pages/
      services/
      styles/
      types/
      utils/
  READMELibro.md
```

## 7. Tecnologias

### Frontend

- React 19.
- TypeScript 5.
- Vite 6.
- Tailwind CSS 4.
- React Router.
- SWR para consultas y revalidacion.
- Recharts para graficos.
- Lucide React para iconos.
- jsPDF para reportes.

### Backend

- Node.js.
- Express 5.
- Prisma 6.
- PostgreSQL.
- Zod para validacion.
- JWT para sesiones.
- bcryptjs para hashes.
- Helmet, CORS y rate limiting de login.
- Jest y Supertest para pruebas.

## 8. Requisitos de operacion local

- PC con Windows y conexion estable.
- Node.js compatible con el proyecto.
- PostgreSQL local activo.
- Base `solar_monitor` creada.
- Variables de entorno configuradas.
- Frontend y backend instalados.
- ESP32 o Raspberry Pi conectado a una red que pueda alcanzar al backend.

Puertos de desarrollo:

| Servicio | Direccion |
| --- | --- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:3000/api` |
| PostgreSQL | `localhost:5432` |

PostgreSQL no debe exponerse directamente a internet.

## 9. Arranque local

### Backend

```bash
cd "backend solar monitor"
npm run prisma:generate
npm run prisma:deploy
npm run dev
```

Comprobacion:

```http
GET http://localhost:3000/api/health
```

### Frontend

```bash
cd "solarmonitor Fronted"
npm run dev
```

Abrir:

```text
http://localhost:5173
```

Las cuentas se crean de forma controlada. La interfaz no muestra credenciales demo.

## 10. Inicio de sesion

1. Abrir SolarMonitor.
2. Escribir el correo asignado.
3. Escribir la contrasena.
4. Pulsar **Entrar al dashboard**.
5. El sistema valida las credenciales y el rol.

Resultados posibles:

- Credenciales correctas: se abre la vista correspondiente al rol.
- Credenciales incorrectas: se muestra un mensaje amigable.
- Backend sin conexion: se informa un problema de red o servidor.
- Rol desconocido: el acceso se rechaza de forma segura.
- Demasiados intentos: el login se limita temporalmente.

## 11. Navegacion

### Administrador

- **Usuarios:** listado y gestion de cuentas.
- **Nuevo usuario:** formulario de creacion.
- **Eliminar:** abre una pantalla de confirmacion antes de borrar.
- **Cerrar sesion:** elimina la sesion local.

### Usuario operativo

- **Dashboard:** centro de metricas y graficos.
- **Dispositivos:** registro y consulta de monitores.
- **Monitoreo:** reglas personales e historicos propios.
- **Meteorologia:** pagina informativa de una integracion futura.
- **Cerrar sesion:** finaliza la sesion.

## 12. Dashboard

El dashboard es el centro de la experiencia operativa.

### Metricas principales

- **Generacion actual:** ultima potencia de generacion disponible.
- **Consumo actual:** ultima potencia de consumo disponible.
- **Balance actual:** generacion menos consumo del mismo intervalo.
- **Ultima lectura:** fecha, generacion, consumo y balance mas recientes.

### Interpretacion del balance

```text
balance = generacion - consumo
```

- Balance positivo: la generacion supera al consumo.
- Balance negativo: el consumo supera a la generacion.
- Balance cero: ambos valores son iguales.
- Balance `null`: no existe una comparacion valida para ese intervalo.

El backend solo calcula balance cuando generacion y consumo pertenecen al mismo bucket temporal. No mezcla timestamps diferentes.

### Rangos

- Hoy.
- Ultimas 24 horas.
- Ultimos 7 dias.
- Ultimos 30 dias.

### Granularidades

- Minutos.
- Horas.
- Dias.
- Meses.

La interfaz actualiza el grafico sin recargar toda la pagina. El usuario puede alternar entre grafico de area y barras.

### Reporte

El boton **Descargar reporte** genera un PDF con el rango y la granularidad seleccionados. El reporte resume metricas y datos disponibles; no inventa valores cuando falta informacion.

## 13. Registro de dispositivos

1. Abrir **Dispositivos**.
2. Pulsar **Nuevo dispositivo**.
3. Escribir un nombre reconocible.
4. Seleccionar ESP32 o Raspberry Pi.
5. Elegir generacion, consumo o bidireccional.
6. Registrar el dispositivo.
7. Copiar inmediatamente `DEVICE_ID` y `DEVICE_KEY`.

### DEVICE_ID

Identificador publico del registro dentro de SolarMonitor. Permanece visible en la interfaz.

### DEVICE_KEY

Clave privada de ingesta. Autoriza al dispositivo para enviar lecturas. Solo se muestra al crear el dispositivo y debe guardarse en un lugar seguro.

Si se pierde `DEVICE_KEY`, debe registrarse un nuevo dispositivo. La clave no debe incluirse en capturas, repositorios ni documentos publicos.

## 14. Conexion del monitor

El firmware necesita como minimo:

- Credenciales de la red WiFi.
- Direccion del backend.
- `DEVICE_ID`.
- `DEVICE_KEY`.
- Lecturas obtenidas desde los sensores reales.

Endpoint:

```http
POST /api/ingestion/devices/:deviceId/readings
Content-Type: application/json
x-device-key: <DEVICE_KEY>
```

Ejemplo de payload bidireccional:

```json
{
  "timestamp": "2026-07-09T14:22:39.000Z",
  "generation": {
    "power": 3.13,
    "voltage": 119.11,
    "current": 26.27
  },
  "consumption": {
    "power": 0.75,
    "voltage": 119.11,
    "current": 6.27
  }
}
```

Tambien se permite enviar solo `generation` o solo `consumption` cuando coincide con la configuracion del dispositivo.

El codigo de integracion es una guia de transporte de datos. En una instalacion real, los valores deben provenir de sensores y del acondicionamiento electrico apropiado; no se deben conectar entradas del ESP32 directamente a voltajes peligrosos.

## 15. Flujo de procesamiento

1. El dispositivo envia el payload.
2. El backend busca el `DEVICE_ID`.
3. Verifica `x-device-key` mediante hash.
4. Valida timestamp, fuente y campos numericos.
5. Normaliza la lectura a un formato comun.
6. Guarda la lectura original.
7. Actualiza el valor actual.
8. Calcula el promedio movil.
9. Compara el promedio con las reglas del propietario del dispositivo.
10. Guarda un historico cuando corresponde.
11. Actualiza resumenes horarios, diarios y mensuales.
12. El dashboard consulta los datos desde PostgreSQL.

Cuando un payload contiene generacion y consumo, todas sus escrituras se ejecutan en una sola transaccion Prisma. Si una parte falla, se revierte el payload completo.

## 16. Monitoreo por usuario

Cada usuario operativo tiene su propia configuracion de monitoreo. Una cuenta nueva recibe valores predeterminados y puede modificarlos sin afectar a las demas cuentas.

Parametros disponibles:

- Ventana temporal del promedio movil.
- Puntos de desviacion superior.
- Puntos de desviacion inferior.
- Intervalo normal de almacenamiento en minutos.
- Intervalo de almacenamiento de anomalias en segundos.
- Cambio significativo del promedio en kW.

Los limites superior e inferior se aplican sobre el promedio movil. No representan lineas absolutas de potencia del sistema.

Los cambios deben realizarse por personal autorizado y documentarse, porque afectan la frecuencia con la que se conservan historicos.

### Aislamiento de cuentas

- Una cuenta nueva inicia sin dispositivos, lecturas ni historicos.
- Al volver a iniciar sesion, el usuario recupera sus propios datos.
- Un usuario no puede consultar dispositivos registrados por otra cuenta.
- Dashboard, estadisticas, tiempo real e historicos se filtran por propietario.
- La ingesta identifica al propietario a partir del dispositivo autenticado.
- El administrador gestiona cuentas, pero no consulta sus datos solares.
- Al eliminar una cuenta se eliminan en cascada solo sus dispositivos y datos relacionados.

## 17. Historicos y resumenes

SolarMonitor conserva:

- Lectura original recibida.
- Ultima lectura por dispositivo y fuente.
- Registros historicos significativos.
- Resumenes horarios.
- Resumenes diarios.
- Resumenes mensuales.

El dashboard consulta series reales desde PostgreSQL. Los filtros `range` y `granularity` determinan el periodo y la agrupacion.

```http
GET /api/dashboard?range=30d&granularity=minute
```

Valores validos:

| Parametro | Valores |
| --- | --- |
| `range` | `today`, `24h`, `7d`, `30d` |
| `granularity` | `minute`, `hour`, `day`, `month` |

## 18. Estados de dispositivos

- **Conectado:** existen lecturas recientes dentro del intervalo esperado.
- **Atencion:** la ultima lectura empieza a quedar fuera del tiempo esperado.
- **Sin conexion:** no existen lecturas recientes o el dispositivo nunca envio datos.

El registro del dispositivo permanece guardado aunque el usuario cambie de pantalla. La conexion se determina por la recepcion de lecturas, no solo por haber creado el registro.

## 19. Seguridad

- JWT para autenticar personas.
- RBAC para controlar permisos.
- Hash bcrypt para contrasenas y claves de dispositivos.
- Validacion Zod para entradas de la API.
- Helmet y CORS en Express.
- Limite predeterminado de cinco intentos de login por IP cada quince minutos.
- Seed demo desactivado salvo habilitacion explicita.
- API canonica exclusivamente bajo `/api`.
- PostgreSQL accesible solo desde el backend.

Buenas practicas operativas:

- No compartir contrasenas.
- No publicar `DEVICE_KEY`.
- Cerrar sesion en equipos compartidos.
- Mantener Windows, Node.js y PostgreSQL actualizados.
- No abrir el puerto `5432` en el router.
- Usar copias de seguridad verificadas.

## 20. Endpoints activos

```text
GET    /api/health
POST   /api/auth/login
GET    /api/auth/me
GET    /api/users
POST   /api/users
DELETE /api/users/:id
GET    /api/devices
POST   /api/devices
GET    /api/devices/:id
GET    /api/dashboard
GET    /api/statistics
GET    /api/realtime/devices
GET    /api/history/devices
GET    /api/monitoring/config
PUT    /api/monitoring/config
POST   /api/ingestion/devices/:deviceId/readings
```

Los endpoints legacy estan desactivados por defecto. Las estructuras antiguas se conservan temporalmente solo cuando son necesarias para compatibilidad.

## 21. Base de datos

PostgreSQL es la unica base activa. Prisma administra el schema y las migraciones.

```env
DATABASE_URL="postgresql://postgres:<password>@localhost:5432/solar_monitor?schema=public"
```

La base almacena principalmente:

- Usuarios, roles y permisos.
- Dispositivos y hashes de claves.
- Lecturas originales.
- Valores actuales.
- Historiales.
- Resumenes temporales.
- Configuracion individual de monitoreo por usuario.
- Auditoria necesaria.

Las migraciones deben aplicarse con Prisma. No se recomienda modificar tablas manualmente desde pgAdmin.

## 22. Respaldo y recuperacion

Antes del lanzamiento se debe establecer:

- Copia automatica diaria de PostgreSQL.
- Conservacion de varias versiones del respaldo.
- Copia adicional fuera de la PC principal.
- Prueba periodica de restauracion.
- Registro de fecha, responsable y resultado.

Ejemplo conceptual de respaldo:

```bash
pg_dump -U postgres -d solar_monitor -F c -f solar_monitor.backup
```

La contrasena y la ubicacion definitiva del respaldo deben configurarse en la PC institucional, no escribirse en este manual publico.

## 23. Solucion de problemas

### La pagina no abre

- Verificar que frontend y backend esten activos.
- Comprobar `/api/health`.
- Confirmar que la PC tenga red.
- Revisar firewall y puertos.

### El login falla

- Revisar correo y contrasena.
- Confirmar que el backend responda.
- Esperar si se alcanzo el limite de intentos.
- Solicitar al administrador una cuenta valida.

### El dispositivo aparece sin conexion

- Revisar WiFi del dispositivo.
- Confirmar la direccion del backend.
- Comprobar `DEVICE_ID` y `DEVICE_KEY`.
- Verificar el codigo HTTP en el monitor serial.
- Confirmar que la fecha NTP sea valida.

### El ESP32 devuelve estado `-1`

Normalmente indica que no pudo establecer la conexion HTTP. Revisar:

- IP o URL sin espacios.
- PC y ESP32 en una red compatible.
- Backend escuchando en la interfaz de red.
- Puerto permitido por Windows Firewall.
- Uso correcto de HTTP o HTTPS.

### No hay puntos en el grafico

- Confirmar que existan lecturas en PostgreSQL.
- Seleccionar otro rango.
- Revisar la granularidad.
- Comprobar que los timestamps pertenezcan al periodo elegido.

### El balance no aparece

La generacion y el consumo deben existir en el mismo bucket temporal. Si falta una fuente, SolarMonitor devuelve `null` para evitar una comparacion incorrecta.

## 24. Verificacion tecnica

Backend:

```bash
npm run lint
npm test
npm run prisma:status
npm run validate:mvp
```

Frontend:

```bash
npm run lint
npm run build
```

Validacion confirmada en la ultima fase:

- 10 suites de pruebas aprobadas.
- 51 pruebas aprobadas.
- Frontend compilado para produccion.
- Esquema PostgreSQL actualizado.
- API de salud, login y dashboard operativos.
- Rutas no canonicas desactivadas.

## 25. Publicacion futura acordada

> Decision guardada, pero NO implementada. Esperar autorizacion antes de configurar el lanzamiento.

La alternativa seleccionada para comenzar sin pagar servidor ni base de datos es:

```text
Usuarios y dispositivos desde internet
                |
                | HTTPS
                v
        Tailscale Funnel
                |
                v
              Caddy
        /             /api
        |               |
     Frontend         Backend
                          |
                          v
                  PostgreSQL local
```

Componentes previstos:

- PC institucional encendida permanentemente.
- Frontend compilado servido localmente.
- Backend Express ejecutado como servicio.
- PostgreSQL almacenado solo en esa PC.
- Caddy como servidor web y reverse proxy.
- Tailscale Funnel como acceso HTTPS publico mediante dominio `ts.net`.

Condiciones antes de publicar:

- Definir responsables de operacion.
- Configurar inicio automatico de servicios.
- Configurar backups y restauracion.
- Ajustar CORS y URL publica del frontend.
- Cambiar el firmware para usar HTTPS.
- Probar acceso externo e ingesta.
- Revisar firewall y registros.
- No publicar PostgreSQL ni el puerto `5432`.

Preparacion tecnica incorporada:

- Express escucha en `127.0.0.1` cuando `NODE_ENV=production`.
- Caddy se considera proxy de confianza solo desde loopback mediante `TRUST_PROXY=loopback`.
- El backend incluye `db:backup` y `db:restore` para PostgreSQL.
- Cada respaldo utiliza formato custom, genera SHA-256 y aplica retencion configurable.
- La restauracion exige confirmacion explicita con `-Force` y debe ejecutarse con el backend detenido.

Si la PC se apaga o pierde internet, la aplicacion deja de estar disponible. Un dominio comercial puede incorporarse mas adelante, pero no es obligatorio para la primera publicacion.

## 26. Evolucion futura

La arquitectura permite incorporar adaptadores sin cambiar la logica central:

- MQTT.
- WebSocket.
- TCP.
- Nuevos sensores.
- Estacion meteorologica.

Estas extensiones deben ingresar al mismo formato comun de lecturas. La estacion meteorologica no tiene procesamiento activo en el backend actual.

## 27. Glosario

| Termino | Definicion |
| --- | --- |
| Generacion | Potencia producida por el sistema fotovoltaico. |
| Consumo | Potencia demandada por las cargas monitoreadas. |
| Balance | Diferencia entre generacion y consumo comparables. |
| Lectura | Medicion enviada por un dispositivo. |
| Historico | Registro conservado para analisis posterior. |
| Granularidad | Nivel temporal usado para agrupar datos. |
| DEVICE_ID | Identificador del dispositivo. |
| DEVICE_KEY | Clave privada que autoriza la ingesta. |
| JWT | Token utilizado para autenticar usuarios. |
| RBAC | Control de acceso basado en roles. |
| NTP | Servicio utilizado para sincronizar fecha y hora. |

## 28. Manual visual A4

El manual se disena en Figma como documento A4 vertical de 30 paginas, con frames de `595 x 842 px`, tipografia Inter estable y estilo basado en la interfaz SolarMonitor.

Lineamientos:

- Margenes seguros y buen espacio en blanco.
- Capturas grandes como elemento principal.
- Encabezado y pie consistentes.
- Numeracion visible.
- Verde solar y azul como colores funcionales.
- Tarjetas suaves, bordes redondeados y sombras discretas.
- Logo institucional utilizado de forma sutil.
- Sin textos pegados a bordes, viudas ni huerfanas.
- Preparado para exportacion a PDF.

Estructura prevista:

1. Portada.
2. Creditos y autores.
3. Autoridades institucionales.
4. Agradecimientos.
5. Indice I.
6. Indice II.
7. Introduccion.
8. Objetivo y alcance.
9. Requisitos y acceso.
10. Inicio de sesion.
11. Roles.
12. Vista general.
13. Navegacion.
14. Dashboard.
15. Metricas.
16. Graficos y comparaciones.
17. Rangos y exportacion.
18. Dispositivos IoT.
19. Registro de dispositivos.
20. DEVICE_ID y DEVICE_KEY.
21. Integracion ESP32.
22. Integracion Raspberry Pi.
23. Monitoreo.
24. Reglas y promedios.
25. Historicos y estadisticas.
26. Estacion meteorologica futura.
27. Administracion de usuarios.
28. Seguridad y problemas comunes.
29. Glosario y soporte.
30. Cierre y QR.

Por ahora, el trabajo en Figma corresponde al formato. El contenido definitivo, capturas reales, nombres institucionales, QR y datos de soporte se incorporaran cuando la aplicacion y el manual sean aprobados.

## 29. Control del documento

Cada actualizacion debe registrar:

- Fecha.
- Funcion modificada.
- Pantalla o modulo afectado.
- Captura que debe renovarse.
- Responsable de validacion.

No incluir en ninguna version publica:

- Contrasenas.
- JWT reales.
- `DEVICE_KEY` reales.
- Direcciones privadas innecesarias.
- Datos personales sin autorizacion.
