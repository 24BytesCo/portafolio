# ⛔ Este proyecto YA NO se sirve desde esta máquina

Migrado el 2026-08-16 al servidor **Contabo `80.190.77.63`** (Nueva Jersey).
El DNS de sus dominios ya apunta al túnel de ese servidor: los sitios están
vivos **con estos contenedores apagados**. Compruébalo antes de dudar.

## No levantes los contenedores aquí

No es mantenimiento: es que ya no atienden tráfico. Lo único que harían al
arrancar es **duplicar sus tareas programadas**, y eso sí hace daño:

- **BetLab**: pipeline de prematch, decisiones de apuestas y subidas a YouTube
  por duplicado, contra dos bases que ya divergen. Toca dinero de inversores.
- **SECOP**: los avisos saldrían dos veces a tres usuarias reales.

## Si necesitas la base para consultar

`docker compose up -d <servicio-de-postgres>` a secas es seguro: es solo la
base, sin la aplicación ni sus crons.

## Nota para BetLab

`betlab-weekly-restart.timer` está **desactivado a propósito**. Era la causa de
que `betlab-worker` muriera cada lunes: `docker compose restart` no respeta
`depends_on: condition: service_healthy`, así que el worker arrancaba antes que
la API, fallaba su chequeo y con `restart: "no"` se quedaba muerto toda la
semana. No lo reactives.

## Dónde trabajar ahora

En el servidor nuevo: `ssh root@80.190.77.63`, misma ruta de proyectos.
