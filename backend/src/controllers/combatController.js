const {
    attackMonster
} = require('../services/combatService');

function attack(req, res) {

    const {
        player,
        monster
    } = req.body;

    const result = attackMonster(player, monster);

    res.json(result);
}

module.exports = {
    attack
};