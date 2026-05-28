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
    lastAttackAt: 0,
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
