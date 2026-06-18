const { pool } = require('../database/connection');

function mapMonster(row) {

  return {
    id: row.id,
    name: row.name,
    race: row.race,
    spriteKey: row.sprite_key,
    level: row.level,
    maxHp: row.max_hp,
    hp: row.max_hp,
  damage: row.damage,
  agroRange: row.agro_range,
  attackRange: row.attack_range,
  attackCooldown: row.attack_cooldown,
  attackStyle: row.attack_style,
  preferredRange: row.preferred_range,
  assistRange: row.assist_range,
  leashRange: row.leash_range,
  projectileKind: row.projectile_kind,
  lootGoldMin: row.loot_gold_min,
  lootGoldMax: row.loot_gold_max,
  lootItemName: row.loot_item_name,
  lootItemChance: Number(row.loot_item_chance || 0),
  lastAttackAt: 0,
  spawnX: row.spawn_x,
  spawnY: row.spawn_y,
  x: row.spawn_x,
  y: row.spawn_y
  };
}

async function getMonstersByZone(zone) {

  const [monsters] = await pool.execute(
    `
      SELECT
        zone_monsters.id,
        monster_templates.name,
        monster_templates.race,
        monster_templates.sprite_key,
        monster_templates.level,
        monster_templates.max_hp,
        monster_templates.damage,
        monster_templates.agro_range,
        monster_templates.attack_range,
        monster_templates.attack_cooldown,
        monster_templates.attack_style,
        monster_templates.preferred_range,
        monster_templates.assist_range,
        monster_templates.leash_range,
        monster_templates.projectile_kind,
        monster_templates.loot_gold_min,
        monster_templates.loot_gold_max,
        monster_templates.loot_item_name,
        monster_templates.loot_item_chance,
        zone_monsters.spawn_x,
        zone_monsters.spawn_y
      FROM zone_monsters
      INNER JOIN monster_templates
        ON monster_templates.id = zone_monsters.monster_template_id
      WHERE zone_monsters.zone_name = :zone
      ORDER BY zone_monsters.id
    `,
    {
      zone
    }
  );

  return monsters.map(mapMonster);
}

module.exports = {
  getMonstersByZone
};
