# Drakonys RPG Lite

RPG web 2D dark fantasy em pixel art, inspirado em Tibia, Ravendawn e RPGs classicos.

O projeto usa Vue.js no frontend, Node.js/Express no backend e MySQL/MariaDB para persistencia.

## Status

Projeto em desenvolvimento ativo.

Atualmente o jogo possui:

- login com user/email e password;
- selecao, criacao e exclusao de personagens;
- classes warrior, mage e archer;
- mapas por zona com recomendacao de level;
- safe zone inicial;
- movimentacao WASD e por click;
- camera seguindo o jogador;
- combate automatico, critico, miss/dodge, defesa e atributos;
- IA basica de monstros;
- elites, bosses, respawn de mobs e farm AFK;
- hotbar, skills, inventario, quests, minimap e UI dark fantasy;
- banco MySQL/MariaDB com schema consolidado.

## Mapas

- Initial City: safe zone.
- Goblin Forest: recomendado `Lv 1-20`.
- Orc Camp: recomendado `Lv 20-40`.
- Elf Woods: recomendado `Lv 40-60`.
- Undead Crypt: recomendado `Lv 60-80`.
- Demon Gate: recomendado `Lv 80-100`.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- MySQL ou MariaDB
- Git

O projeto inclui scripts em `scripts/` para usar Node 20 local quando disponivel.

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

Opcionalmente, configure o frontend:

```bash
copy frontend\.env.example frontend\.env
```

Em desenvolvimento, `VITE_API_BASE_URL` pode ficar vazio para usar o proxy do Vite.

## Criar base de dados

Abra uma conexao MySQL/MariaDB no DBeaver, MySQL Workbench ou terminal e execute:

1. `backend/database/schema.sql`
2. `backend/database/seed_monsters.sql`

O `schema.sql` consolida o estado atual das migrations. Em ambientes existentes, confira tambem `backend/database/migrations/`.

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
- `backend/database/schema.sql`: schema consolidado para novos ambientes.
- `backend/database/seed_monsters.sql`: dados iniciais de monstros e spawns.
- `frontend/`: jogo Vue e assets.
- `frontend/src/components/Game/`: experiencia principal do jogo.
- `frontend/src/data/`: dados de mapas, mobs, bosses, quests, skills e itens.
- `rules/`: regras, contratos, lore e guias de desenvolvimento.

## Contribuir

Contribuicoes sao bem-vindas.

Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir pull requests.

Tambem consulte:

- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [ASSETS.md](ASSETS.md)

## Licenca

Distribuido sob a licenca MIT. Veja [LICENSE](LICENSE).
