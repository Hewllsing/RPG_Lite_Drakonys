# Base de dados

Use estes scripts no DBeaver com uma conexao MySQL ou MariaDB ativa.

1. Abra `schema.sql` e execute o script completo.
2. Abra `seed_monsters.sql` e execute o script completo.
3. Se a base ja existir, execute os scripts da pasta `migrations` pela ordem numerica.
4. Copie `backend/.env.example` para `backend/.env`.
5. Ajuste `DB_USER` e `DB_PASSWORD` conforme a sua conexao local.

O backend usa a base `rpg_lite_drakonys` por padrao.
