# MCP---LangGraph

## Docker

Este proyecto se levanta con tres servicios:

- `db`: PostgreSQL para la base de datos.
- `backend`: FastAPI + LangGraph + MCP.
- `frontend`: React compilado y servido por Nginx.

### Modo desarrollo

La configuración actual ya levanta el stack con hot reload.

En este modo:

- el backend usa `uvicorn --reload`
- el frontend usa Vite en modo desarrollo
- el código del proyecto se monta dentro de los contenedores para reflejar cambios al instante

### Requisitos

Antes de levantar los contenedores, define estas variables de entorno en tu shell o en un archivo `.env` en la raíz:

- `GOOGLE_API_KEY`
- `PINECONE_API_KEY`

### Arranque

```bash
docker compose up --build
```

Luego abre:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

### Base de datos

El `DATABASE_URL` ya apunta al contenedor de PostgreSQL incluido en el compose:

```text
postgresql+psycopg2://mcp:mcp@db:5432/mcp
```

### Notas

- El servidor MCP no va como contenedor aparte porque el backend lo lanza como proceso hijo cuando se necesita.
- Si cambias el código, basta con guardar y el contenedor reflejará el cambio.
- Si quieres una imagen estática para producción, puedo dejarte una segunda composición separada.