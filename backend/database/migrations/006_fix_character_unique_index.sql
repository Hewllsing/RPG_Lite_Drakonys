USE rpg_lite_drakonys;

ALTER TABLE characters
  DROP INDEX IF EXISTS uq_characters_user_id,
  ADD UNIQUE KEY IF NOT EXISTS uq_characters_user_name (user_id, name),
  ADD KEY IF NOT EXISTS idx_characters_user_id (user_id);
