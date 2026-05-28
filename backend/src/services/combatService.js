function attackMonster(player, monster) {

  const damage = 10 + player.strength;

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
    killed,
    xpGained
  };
}

module.exports = {
  attackMonster
};