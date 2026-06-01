# DATABASE GUIDELINES

Objetivo:
Manter a base de dados consistente, escalável e preparada para MMORPG.

Regras:
- Nunca alterar tabelas sem atualizar models.
- Criar migrations para toda alteração estrutural.
- Utilizar foreign keys sempre que possível.
- Evitar dados duplicados.
- Criar índices para consultas frequentes.

Tabelas previstas:
- accounts
- characters
- inventories
- items
- skills
- quests
- monsters
- npc
- guilds
- parties
- zones
