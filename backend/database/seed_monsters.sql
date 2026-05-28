USE rpg_lite_drakonys;

INSERT INTO monster_templates (
  id,
  name,
  race,
  sprite_key,
  level,
  max_hp,
  damage,
  agro_range,
  attack_range,
  attack_cooldown
)
VALUES
  (1, 'Goblin', 'Goblin', 'goblin', 1, 40, 7, 5, 1, 1600),
  (2, 'Goblin Warrior', 'Goblin', 'goblin', 2, 60, 10, 6, 1, 1800),
  (3, 'Orc Scout', 'Orc', 'orc', 4, 100, 16, 6, 1, 1900),
  (4, 'Elf Ranger', 'Elf', 'elf', 3, 75, 13, 7, 1, 1500),
  (5, 'Skeleton Guard', 'Skeleton', 'skeleton', 3, 85, 14, 6, 1, 1700),
  (6, 'Demon Imp', 'Demon', 'demon', 7, 160, 24, 8, 1, 2200),
  (7, 'Orc', 'Orc', 'orc', 5, 120, 18, 7, 1, 2000),
  (8, 'Orc Brute', 'Orc', 'orc', 6, 150, 22, 7, 1, 2100),
  (9, 'Demon', 'Demon', 'demon', 8, 190, 28, 8, 1, 2300)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  race = VALUES(race),
  sprite_key = VALUES(sprite_key),
  level = VALUES(level),
  max_hp = VALUES(max_hp),
  damage = VALUES(damage),
  agro_range = VALUES(agro_range),
  attack_range = VALUES(attack_range),
  attack_cooldown = VALUES(attack_cooldown);

INSERT INTO zone_monsters (
  id,
  zone_name,
  monster_template_id,
  spawn_x,
  spawn_y
)
VALUES
  (1, 'Goblin Forest', 1, 10, 5),
  (2, 'Goblin Forest', 2, 12, 8),
  (3, 'Goblin Forest', 3, 14, 5),
  (4, 'Goblin Forest', 4, 4, 10),
  (5, 'Goblin Forest', 5, 8, 12),
  (6, 'Goblin Forest', 6, 16, 10),
  (7, 'Orc Camp', 7, 15, 10),
  (8, 'Orc Camp', 8, 13, 7),
  (9, 'Elf Grove', 4, 10, 8),
  (10, 'Skeleton Crypt', 5, 11, 9),
  (11, 'Demon Ruins', 9, 14, 9)
ON DUPLICATE KEY UPDATE
  zone_name = VALUES(zone_name),
  monster_template_id = VALUES(monster_template_id),
  spawn_x = VALUES(spawn_x),
  spawn_y = VALUES(spawn_y);
