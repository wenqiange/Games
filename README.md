# WhenGames — Plataforma de Mini Juegos

Proyecto base con React + Vite que incluye un primer juego: Ajedrez, y una API Express/MySQL para login & registro.

Cómo usar

1. Instala dependencias:

```bash
npm install
```

2. Levanta la API (requiere MySQL, ver `.env.example` en `/server`):

```bash
npm run api
```

3. Desarrollo (frontend):

```bash
npm start
```

4. Build para producción (frontend):

```bash
npm run build
```

Assets

Ya se incluyen las piezas estilo **Cburnett** (SVG, CC BY-SA 3.0). Consulta `src/assets/README_assets.md` para créditos completos o para cambiar a otro set.

Backend (login/register)

- Copia `server/.env.example` a `server/.env` y ajusta las credenciales.
- La API crea automáticamente la tabla `users` si no existe.
- Endpoints:
	- `POST /api/auth/register` → `{ username, email, password }`
	- `POST /api/auth/login` → `{ email, password }`

Archivos clave

- `src/games/chess/chessEngine.js`: lógica del juego y bot.
- `src/components/Board.jsx`, `Piece.jsx`, `DifficultySelector.jsx`: componentes de UI.
- `src/pages/ChessPage.jsx`: página del juego y enlace con el motor.
- `src/pages/AuthPage.jsx` + `src/services/authService.js`: formularios y consumo de la API.
- `server/index.js`: API Express + MySQL.

Notas

El motor implementa reglas principales (movimiento, captura, enroque y promoción). El bot tiene 3 niveles: fácil, medio y difícil (minimax con poda). La interfaz es responsiva, con tablero orientable y resaltado de movimientos, y el módulo de cuentas usa MySQL para login/registro.
