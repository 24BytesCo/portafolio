#!/usr/bin/env bash
# Crea la clave de API de Umami y la deja en el .env del servidor. SE EJECUTA
# EN EL SERVIDOR (Contabo), donde vive la contraseña del panel.
#
# Evita el paso manual: entra al panel por su API con el usuario admin (cuya
# contraseña está en ~/.umami-admin-pass, modo 600), crea una clave llamada
# «contador-lecturas» y la escribe en el .env. Nada se imprime: ni la
# contraseña ni la clave aparecen en pantalla ni en la lista de procesos.
#
# Umami no es alcanzable desde el anfitrión (no publica puertos), así que la
# petición se hace desde dentro de portafolio-web, que comparte su red.
set -Eeuo pipefail
cd "$(dirname "$0")/.."

CLAVE_ADMIN=$(cat ~/.umami-admin-pass)

NUEVA=$(printf '%s' "$CLAVE_ADMIN" | docker exec -i portafolio-web node -e '
const leer = async () => {
  let d = ""; for await (const c of process.stdin) d += c; return d.trim();
};
(async () => {
  const base = "http://portafolio-umami:3000/stats/api";
  const password = await leer();
  const login = await fetch(base + "/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "admin", password }),
  });
  if (!login.ok) { console.error("login " + login.status); process.exit(1); }
  const { token } = await login.json();

  const cabeceras = { "content-type": "application/json", authorization: "Bearer " + token };
  const existentes = await fetch(base + "/me/api-keys", { headers: cabeceras });
  if (existentes.ok) {
    const lista = await existentes.json();
    const filas = Array.isArray(lista) ? lista : (lista.data ?? []);
    if (filas.some((k) => k.name === "contador-lecturas")) {
      console.error("Ya existe una clave llamada contador-lecturas. Bórrala en el panel y repite, o usa la que tengas.");
      process.exit(2);
    }
  }

  const creada = await fetch(base + "/me/api-keys", {
    method: "POST",
    headers: cabeceras,
    body: JSON.stringify({ name: "contador-lecturas" }),
  });
  if (!creada.ok) { console.error("crear " + creada.status); process.exit(1); }
  const { key } = await creada.json();
  if (!key) { console.error("la respuesta no trae la clave"); process.exit(1); }
  process.stdout.write(key);
})();
')

if [[ -z "${NUEVA// }" ]]; then
  echo "No se obtuvo clave; el .env no se tocó." >&2
  exit 1
fi

cp .env ".env.respaldo-$(date +%Y%m%d-%H%M)"
grep -v '^UMAMI_API_KEY=' .env > .env.nuevo
printf 'UMAMI_API_KEY=%s\n' "$NUEVA" >> .env.nuevo
mv .env.nuevo .env
chmod 600 .env
unset NUEVA

docker compose -f docker-compose.deploy.yml up -d --force-recreate --no-deps portafolio-web >/dev/null
sleep 8
docker exec portafolio-web sh -c 'test -n "$UMAMI_API_KEY"' &&
  echo "Clave creada, guardada en el .env y cargada en el contenedor."
