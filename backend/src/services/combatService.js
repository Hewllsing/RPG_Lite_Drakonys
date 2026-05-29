function attackMonster(player, monster) {

  const strength = Number(player.strength) || 0;
  const dexterity = Number(player.dexterity) || 0;
  const accuracyChance =
    Math.min(0.98, 0.82 + dexterity * 0.01);
  const criticalChance =
    Math.min(0.4, dexterity * 0.02);
  const hit = Math.random() <= accuracyChance;
  const critical =
    hit && Math.random() <= criticalChance;
  let damage = 0;

  // Forca aumenta o dano fisico do ataque basico.
  if (hit) {
    damage = 8 + strength * 2;

    if (critical) {
      damage = Math.floor(damage * 1.5);
    }
  }

  monster.hp -= damage;

  let killed = false;
  let xpGained = 0;

  if (monster.hp <= 0) {

    monster.hp = 0;

    killed = true;

    xpGained = monster.level * 20;
  }

  return {
    damage,
    monster,
    hit,
    critical,
    killed,
    xpGained
  };
}

module.exports = {
  attackMonster
};
