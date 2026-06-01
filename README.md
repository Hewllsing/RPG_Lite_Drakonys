# Drakonys RPG Lite

RPG web 2D com frontend Vue, backend Node/Express e banco MySQL/MariaDB.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- MySQL ou MariaDB
- Git

O projeto inclui scripts em `scripts/` para usar Node 20 quando disponivel.

## Instalar dependencias

Na raiz do projeto:

```bash
npm run install:all
```

Isso instala as dependencias do backend e do frontend.

## Configurar ambiente

Copie o arquivo de exemplo do backend:

```bash
copy backend\.env.example backend\.env
```

Edite `backend/.env` conforme sua conexao local:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=rpg_lite_drakonys
DB_CONNECTION_LIMIT=10
```

## Criar base de dados

Abra uma conexao MySQL/MariaDB no DBeaver, MySQL Workbench ou terminal e execute:

1. `backend/database/schema.sql`
2. `backend/database/seed_monsters.sql`

O `schema.sql` ja consolida o estado atual das migrations do projeto, entao um novo ambiente nao precisa executar cada arquivo de `backend/database/migrations` manualmente.

## Rodar em desenvolvimento

Em dois terminais separados:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Padroes locais:

- Backend: `http://localhost:3000`
- Frontend: URL exibida pelo Vite no terminal

## Validar antes de subir

```bash
node --check backend/src/services/characterService.js
node --check frontend/src/components/Game/Game.js
npm run build:frontend
```

## Organizacao

- `backend/`: API, servicos e conexao com banco.
- `frontend/`: jogo Vue e assets.
- `backend/database/schema.sql`: schema consolidado para novos ambientes.
- `backend/database/seed_monsters.sql`: dados iniciais de monstros e spawns.
- `rules/`: regras, contratos, lore e guias de desenvolvimento.
