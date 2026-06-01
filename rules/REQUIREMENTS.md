# Requirements

Este arquivo centraliza o setup para qualquer pessoa conseguir preparar o projeto sem procurar dependencias em varias pastas.

## Ambiente

- Node.js 20 ou superior
- npm 10 ou superior
- MySQL ou MariaDB
- DBeaver opcional para gerir a base de dados

## Instalar dependencias

Na raiz do projeto:

```bash
npm run install:all
```

Esse comando instala as dependencias do backend e do frontend usando os `package-lock.json` de cada pasta.

## Rodar o projeto

Backend:

```bash
npm run dev:backend
```

Frontend:

```bash
npm run dev:frontend
```

Build do frontend:

```bash
npm run build:frontend
```

## Base de dados

Os schemas SQL ficam em:

- `backend/database/schema.sql`
- `backend/database/migrations/`
- `backend/database/seed_monsters.sql`

Sempre que uma funcionalidade alterar tabelas, colunas, indices ou dados base, atualize os arquivos SQL junto com o codigo.

## Variaveis de ambiente

Use os arquivos `.env.example` como base e crie os `.env` locais necessarios. Arquivos `.env` reais nao devem ser commitados.
