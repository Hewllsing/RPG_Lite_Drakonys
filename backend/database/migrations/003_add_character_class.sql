USE rpg_lite_drakonys;

ALTER TABLE characters
  ADD COLUMN character_class VARCHAR(20) NOT NULL DEFAULT 'warrior'
  AFTER name;
