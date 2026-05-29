USE rpg_lite_drakonys;

ALTER TABLE characters
  DROP INDEX uq_characters_user_id,
  ADD UNIQUE KEY uq_characters_user_name (user_id, name),
  ADD KEY idx_characters_user_id (user_id);
