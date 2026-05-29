USE rpg_lite_drakonys;

ALTER TABLE characters
  ADD COLUMN IF NOT EXISTS gold INT NOT NULL DEFAULT 0 AFTER attribute_points,
  ADD COLUMN IF NOT EXISTS inventory_json LONGTEXT NULL AFTER gold,
  ADD COLUMN IF NOT EXISTS equipment_json LONGTEXT NULL AFTER inventory_json;

UPDATE characters
SET
  inventory_json = '[]',
  equipment_json = '{"weapon":null,"armor":null,"accessory":null}'
WHERE
  inventory_json IS NULL OR
  inventory_json = '' OR
  equipment_json IS NULL OR
  equipment_json = '';

ALTER TABLE characters
  MODIFY inventory_json LONGTEXT NOT NULL,
  MODIFY equipment_json LONGTEXT NOT NULL;
