USE rpg_lite_drakonys;

ALTER TABLE monster_templates
  ADD COLUMN IF NOT EXISTS attack_style VARCHAR(20) NOT NULL DEFAULT 'melee' AFTER attack_cooldown,
  ADD COLUMN IF NOT EXISTS preferred_range INT NOT NULL DEFAULT 1 AFTER attack_style,
  ADD COLUMN IF NOT EXISTS assist_range INT NOT NULL DEFAULT 2 AFTER preferred_range,
  ADD COLUMN IF NOT EXISTS leash_range INT NOT NULL DEFAULT 9 AFTER assist_range,
  ADD COLUMN IF NOT EXISTS projectile_kind VARCHAR(30) NULL DEFAULT NULL AFTER leash_range,
  ADD COLUMN IF NOT EXISTS loot_gold_min INT NOT NULL DEFAULT 0 AFTER projectile_kind,
  ADD COLUMN IF NOT EXISTS loot_gold_max INT NOT NULL DEFAULT 0 AFTER loot_gold_min,
  ADD COLUMN IF NOT EXISTS loot_item_name VARCHAR(80) NULL DEFAULT NULL AFTER loot_gold_max,
  ADD COLUMN IF NOT EXISTS loot_item_chance DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER loot_item_name;
