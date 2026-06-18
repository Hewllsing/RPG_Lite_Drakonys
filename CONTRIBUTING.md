# Contribuindo

Obrigado por querer contribuir com o Drakonys RPG Lite.

## Como comecar

1. Faca um fork do repositorio.
2. Crie uma branch com um nome claro, por exemplo `feature/new-skill`.
3. Rode `npm run install:all` na raiz do projeto.
4. Configure `backend/.env` com base em `backend/.env.example`.
5. Execute `backend/database/schema.sql` e `backend/database/seed_monsters.sql`.
6. Rode backend e frontend em terminais separados.

```bash
npm run dev:backend
npm run dev:frontend
```

## Padrao de desenvolvimento

- Mantenha mudancas pequenas e focadas.
- Preserve funcionalidades existentes de movimento, camera, combate, UI e login.
- Atualize `backend/database/schema.sql`, seeds ou migrations quando houver mudanca no banco.
- Evite dependencias novas sem explicar o motivo no pull request.
- Use JavaScript simples e siga o estilo atual do projeto.

## Validacao

Antes de abrir um pull request, rode:

```bash
npm run build:frontend
node --check backend/src/services/characterService.js
node --check frontend/src/components/Game/Game.js
```

Se algum comando nao se aplicar a sua mudanca, explique isso no pull request.

## Pull requests

Inclua:

- resumo do que mudou;
- como testar;
- screenshots ou videos quando a mudanca afetar UI/gameplay;
- observacoes sobre banco de dados, se houver.

## Issues

Ao abrir uma issue, descreva:

- comportamento esperado;
- comportamento atual;
- passos para reproduzir;
- sistema operacional e versao do Node/npm.
