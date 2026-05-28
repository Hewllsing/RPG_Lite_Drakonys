function getCharacterData() {
    return {
        id: 1,
        name: 'Hero',
        level: 1,
        xp: 0,
        hp: 100,
        mana: 50,
        strength: 5,
        intelligence: 5,
        dexterity: 5,
        attributePoints: 0,
        currentZone: 'Goblin Forest',
        x: 5,
        y: 5
    };
}

module.exports = {
    getCharacterData
};