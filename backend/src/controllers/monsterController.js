const {
  getMonstersByZone
} = require('../services/monsterService');

function getMonsters(req, res) {

  const zone = req.query.zone;

  const monsters = getMonstersByZone(zone);

  res.json(monsters);
}

module.exports = {
  getMonsters
};