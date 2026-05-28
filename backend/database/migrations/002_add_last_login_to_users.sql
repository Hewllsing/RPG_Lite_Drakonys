USE rpg_lite_drakonys;

ALTER TABLE users
  ADD COLUMN last_login_at DATETIME NULL DEFAULT NULL
  AFTER password_hash;
