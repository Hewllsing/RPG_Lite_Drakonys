const {
  getMonstersByZone
} = require('../services/monsterService');

async function getMonsters(req, res) {

  try {
    const zone = req.query.zone;

    const monsters = await getMonstersByZone(zone);

    res.json(monsters);
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao carregar monstros.'
    });
  }
}

module.exports = {
  getMonsters
};
