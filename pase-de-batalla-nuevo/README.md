# Bot de La Recaída 🌑

Bot propio para el servidor **La Recaída**, con sistema de economía de **Lunas** (reemplaza a UnbelievaBoat) y comando de **anuncios**.

## Comandos incluidos

**Economía**
- `/balance [usuario]` — ver saldo de Lunas
- `/daily` — recompensa diaria (50 Lunas, cada 24h)
- `/work` — trabajar por Lunas (10-40, cada 1h)
- `/pay usuario cantidad` — transferir Lunas a otro miembro
- `/leaderboard` — ranking de Lunas del server
- `/lunas-admin dar|quitar|fijar` — (solo admins) gestionar Lunas de cualquiera

**Anuncios**
- `/anuncio titulo mensaje [canal] [mencionar] [imagen]` — publica un embed prolijo con la paleta violeta/azul de La Recaída, con opción de mencionar @everyone/@here

**Pase de Batalla**
- `/pase` — ver tu nivel actual, costo y recompensa del siguiente nivel
- `/pase-comprar` — comprar el siguiente nivel gastando Lunas (entrega Lunas de recompensa, y un rol si ese nivel lo tiene configurado)
- `/pase-top` — ranking de niveles del server
- `/pase-admin costo base:X incremento:Y` — (solo admins) configurar cuánto cuesta el nivel 1 y cuánto sube el costo por cada nivel
- `/pase-admin nivel-maximo nivel:X` — (solo admins) configurar hasta qué nivel se puede llegar
- `/pase-admin recompensa nivel:X lunas:Y rol:@rol` — (solo admins) configurar qué entrega un nivel específico (los niveles sin configurar dan automáticamente 30% de su costo en Lunas, sin rol)
- `/pase-admin ver-config` — (solo admins) ver toda la configuración actual del pase

**Importante sobre roles del Pase de Batalla:** para que el bot pueda asignar un rol como recompensa, el rol del bot ("El Recaído") tiene que estar **por encima** del rol que querés entregar, en la lista de roles del servidor (Configuración del servidor → Roles → arrastrar el orden). Si no, el bot no va a poder asignarlo y te va a avisar con un mensaje de error al comprar ese nivel.

Todos los saldos se guardan en un archivo local `economia.json` (se crea solo, no necesitás nada externo ni instalar programas adicionales).

## 1. Crear la aplicación en Discord

1. Andá a https://discord.com/developers/applications → **New Application** → nombrala "La Recaída" (o el nombre que quieras).
2. En la pestaña **Bot** → **Reset Token** → copiá el token (ojo, no lo compartas con nadie).
3. En **Bot** → activá **Server Members Intent** si más adelante querés agregar comandos que dependan de miembros (no es obligatorio para lo que armamos ahora).
4. En **OAuth2 → URL Generator**: marcá `bot` y `applications.commands` como scopes, y en permisos marcá al menos `Send Messages`, `Embed Links`, `Manage Roles` (si más adelante lo usás para roles). Copiá la URL generada y abrila en el navegador para invitar el bot a tu server.

## 2. Configurar el proyecto

1. Copiá `.env.example` a `.env`:
   ```
   cp .env.example .env
   ```
2. Completá en `.env`:
   - `DISCORD_TOKEN`: el token del paso anterior
   - `CLIENT_ID`: el **Application ID** (está en la misma página, "General Information")
   - `GUILD_ID`: el ID de tu servidor (activá el modo desarrollador en Discord: Configuración → Avanzado → Modo desarrollador, después clic derecho sobre el ícono del server → "Copiar ID")
   - `ADMIN_ROLE_ID` (opcional): el ID del rol que además de "Gestionar servidor" pueda usar `/lunas-admin` (por ejemplo tu rol Dios Pepsi o El Recaído)

## 3. Instalar dependencias y registrar comandos

```bash
npm install
npm run deploy
```

`npm run deploy` sube los slash commands a tu servidor (con `GUILD_ID` configurado aparecen al instante).

## 4. Levantar el bot

```bash
npm start
```

Si ves `✅ Conectado como ...` en la consola, ya está online. Probá `/balance` en tu server.

## Hosting 24/7

Para que el bot quede online todo el tiempo (no solo mientras tenés la consola abierta), podés usar un servicio gratuito/económico como **Railway**, **Render** o un VPS. El proceso es: subir esta carpeta a un repo de GitHub, conectarlo al servicio, configurar las mismas variables de entorno del `.env`, y correr `npm start` como comando de arranque.

## Ideas para más adelante

- Integrar `/anuncio` con un webhook con nombre e imagen custom (como hacés con "Eclipse")
- Agregar una tienda propia de ítems/roles comprables con Lunas
- Comandos de logs de economía en `#logros` (igual que tenías con UnbelievaBoat)
