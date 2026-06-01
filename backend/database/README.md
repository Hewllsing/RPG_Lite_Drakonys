# Base de dados

Use estes scripts no DBeaver com uma conexao MySQL ou MariaDB ativa.

1. Abra `schema.sql` e execute o script completo.
2. Abra `seed_monsters.sql` e execute o script completo.
3. Copie `backend/.env.example` para `backend/.env`.
4. Ajuste `DB_USER` e `DB_PASSWORD` conforme a sua conexao local.

O `schema.sql` ja consolida as migrations atuais. A pasta `migrations` fica como historico incremental para ambientes antigos, mas novos ambientes nao precisam executar cada arquivo manualmente.

O backend usa a base `rpg_lite_drakonys` por padrao.
