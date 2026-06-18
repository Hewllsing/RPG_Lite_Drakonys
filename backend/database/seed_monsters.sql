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
  attack_cooldown,
  attack_style,
  preferred_range,
  assist_range,
  leash_range,
  projectile_kind,
  loot_gold_min,
  loot_gold_max,
  loot_item_name,
  loot_item_chance
)
VALUES
  (1, 'Goblin', 'Goblin', 'goblin', 1, 80, 7, 5, 1, 1600, 'melee', 1, 2, 8, NULL, 2, 5, 'goblin-ear', 16.00),
  (2, 'Goblin Warrior', 'Goblin', 'goblin', 2, 120, 10, 6, 1, 1800, 'melee', 1, 2, 9, NULL, 4, 8, 'rusty-dagger', 12.00),
  (3, 'Orc Scout', 'Orc', 'orc', 4, 200, 16, 6, 1, 1900, 'melee', 1, 3, 10, NULL, 7, 12, 'scout-badge', 14.00),
  (4, 'Elf Ranger', 'Elf', 'elf', 3, 150, 13, 7, 4, 1500, 'ranged', 3, 3, 10, 'monster-arrow', 6, 14, 'elven-feather', 24.00),
  (5, 'Skeleton Guard', 'Skeleton', 'skeleton', 3, 170, 14, 6, 1, 1700, 'melee', 1, 2, 9, NULL, 5, 10, 'bone-fragment', 22.00),
  (6, 'Demon Imp', 'Demon', 'demon', 7, 320, 24, 8, 3, 2200, 'ranged', 2, 4, 12, 'monster-shadow', 12, 20, 'infernal-shard', 18.00),
  (7, 'Orc', 'Orc', 'orc', 5, 240, 18, 7, 1, 2000, 'melee', 1, 3, 11, NULL, 8, 14, 'orc-tooth', 16.00),
  (8, 'Orc Brute', 'Orc', 'orc', 6, 300, 22, 7, 1, 2100, 'melee', 1, 4, 11, NULL, 10, 18, 'brute-pauldron', 10.00),
  (9, 'Demon', 'Demon', 'demon', 8, 380, 28, 8, 4, 2300, 'ranged', 3, 4, 13, 'monster-shadow', 16, 26, 'demonic-ember', 20.00)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  race = VALUES(race),
  sprite_key = VALUES(sprite_key),
  level = VALUES(level),
  max_hp = VALUES(max_hp),
  damage = VALUES(damage),
  agro_range = VALUES(agro_range),
  attack_range = VALUES(attack_range),
  attack_cooldown = VALUES(attack_cooldown),
  attack_style = VALUES(attack_style),
  preferred_range = VALUES(preferred_range),
  assist_range = VALUES(assist_range),
  leash_range = VALUES(leash_range),
  projectile_kind = VALUES(projectile_kind),
  loot_gold_min = VALUES(loot_gold_min),
  loot_gold_max = VALUES(loot_gold_max),
  loot_item_name = VALUES(loot_item_name),
  loot_item_chance = VALUES(loot_item_chance);

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
