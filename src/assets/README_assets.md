## Instrucciones para los assets de ajedrez

El proyecto ya incluye el set **Cburnett** (CC BY-SA 3.0) descargado desde Wikimedia Commons. Los SVG se sirven desde `public/assets/chess/` (y mantenemos una copia editable en `src/assets/chess/` para referencia):

- `w_k.svg` - Rey blanco
- `w_q.svg` - Reina blanca
- `w_r.svg` - Torre blanca
- `w_b.svg` - Alfil blanco
- `w_n.svg` - Caballo blanco
- `w_p.svg` - Peón blanco
- `b_k.svg` - Rey negro
- `b_q.svg` - Reina negra
- `b_r.svg` - Torre negra
- `b_b.svg` - Alfil negro
- `b_n.svg` - Caballo negro
- `b_p.svg` - Peón negro

> Créditos: Christian Stein (Cburnett). Fuente: [Wikimedia Commons - Category:SVG chess pieces](https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces). Licencia: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).

### ¿Quieres usar otro set?

1. Elimina o respalda los archivos actuales en `public/assets/chess/` (y opcionalmente en `src/assets/chess/`).
2. Descarga tu set preferido (PNG o SVG) asegurándote de que respeta la misma convención de nombres (`w_k`, `b_q`, etc.).
3. Copia esos archivos en `public/assets/chess/`. Los recursos públicos se sirven directamente desde `/assets/chess/...`.

Fuentes sugeridas adicionales:
- Wikimedia Commons — busca "SVG chess pieces" para sets libres.
- [Lichess pieces](https://github.com/lichess-org/lila/tree/master/public/images/pieces) — revisa licencias de cada set antes de usarlos.

