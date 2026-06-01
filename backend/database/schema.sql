-- Schema consolidado para novos ambientes.
-- Inclui o estado final das migrations atuais, entao nao e necessario
-- executar cada arquivo de backend/database/migrations manualmente.

CREATE DATABASE IF NOT EXISTS rpg_lite_drakonys
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rpg_lite_drakonys;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(40) NOT NULL,
  email VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  last_login_at DATETIME NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_sessions_token (token),
  KEY idx_user_sessions_user_id (user_id),
  CONSTRAINT fk_user_sessions_user
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS characters (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  name VARCHAR(60) NOT NULL,
  character_class VARCHAR(20) NOT NULL DEFAULT 'warrior',
  level INT UNSIGNED NOT NULL DEFAULT 1,
  xp INT UNSIGNED NOT NULL DEFAULT 0,
  hp INT NOT NULL DEFAULT 100,
  max_hp INT NOT NULL DEFAULT 100,
  mana INT NOT NULL DEFAULT 50,
  max_mana INT NOT NULL DEFAULT 50,
  strength INT NOT NULL DEFAULT 5,
  intelligence INT NOT NULL DEFAULT 5,
  dexterity INT NOT NULL DEFAULT 5,
  attribute_points INT NOT NULL DEFAULT 0,
  gold INT NOT NULL DEFAULT 0,
  inventory_json LONGTEXT NOT NULL,
  equipment_json LONGTEXT NOT NULL,
  current_zone VARCHAR(80) NOT NULL DEFAULT 'Goblin Forest',
  x INT NOT NULL DEFAULT 5,
  y INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_characters_user_name (user_id, name),
  KEY idx_characters_user_id (user_id),
  CONSTRAINT fk_characters_user
    FOREIGN KEY (user_id)
    REFERENCES users (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS monster_templates (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(80) NOT NULL,
  race VARCHAR(40) NOT NULL,
  sprite_key VARCHAR(40) NOT NULL,
  level INT UNSIGNED NOT NULL,
  max_hp INT NOT NULL,
  damage INT NOT NULL,
  agro_range INT NOT NULL,
  attack_range INT NOT NULL,
  attack_cooldown INT NOT NULL,
  attack_style VARCHAR(20) NOT NULL DEFAULT 'melee',
  preferred_range INT NOT NULL DEFAULT 1,
  assist_range INT NOT NULL DEFAULT 2,
  leash_range INT NOT NULL DEFAULT 9,
  projectile_kind VARCHAR(30) NULL DEFAULT NULL,
  loot_gold_min INT NOT NULL DEFAULT 0,
  loot_gold_max INT NOT NULL DEFAULT 0,
  loot_item_name VARCHAR(80) NULL DEFAULT NULL,
  loot_item_chance DECIMAL(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS zone_monsters (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  zone_name VARCHAR(80) NOT NULL,
  monster_template_id INT UNSIGNED NOT NULL,
  spawn_x INT NOT NULL,
  spawn_y INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_zone_monsters_zone_name (zone_name),
  CONSTRAINT fk_zone_monsters_template
    FOREIGN KEY (monster_template_id)
    REFERENCES monster_templates (id)
    ON DELETE CASCADE
);
