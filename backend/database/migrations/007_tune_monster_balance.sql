USE rpg_lite_drakonys;

-- Balanceamento: menos spawns simultaneos e criaturas com mais vida.
UPDATE monster_templates
SET max_hp = CASE id
  WHEN 1 THEN 80
  WHEN 2 THEN 120
  WHEN 3 THEN 200
  WHEN 4 THEN 150
  WHEN 5 THEN 170
  WHEN 6 THEN 320
  WHEN 7 THEN 240
  WHEN 8 THEN 300
  WHEN 9 THEN 380
  ELSE max_hp
END
WHERE id IN (1, 2, 3, 4, 5, 6, 7, 8, 9);

DELETE FROM zone_monsters
WHERE zone_name = 'Goblin Forest'
  AND id IN (5, 6);
