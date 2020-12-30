const { database } = require('../../../../settings.json');
const { searchingObjType, NotFoundError } = require('../../../err/errors');

module.exports = {
    name: 'addxp',
    description: 'Modify player\'s/players XP.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'characterName' }, { type: 'number' }]
        ]
    },
    MAX_LVL: 20,
    async execute(message, [characterName, addXP], mongo, discordClient) {
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }

        const characterAdvancement = await mongo.tryFind(database.collections.data, { name: 'CharacterAdvancement' });
        if (!characterAdvancement) {
            throw new NotFoundError(searchingObjType.dataFile, 'CharacterAdvancement');
        }

        const isNextLevelExp = (exp) =>
            exp > sheet.xp + Number(addXP);

        const newLvl = Object.values(characterAdvancement.content.xp).findIndex(
            isNextLevelExp
        );

        const newValues = {
            $set: {
                level: newLvl,
                xp: sheet.xp + Number(addXP),
            },
        };

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newValues);

        //log
        discordClient.emit('sessionLog', 'addxp', [characterName, addXP]);

        //emit events due to reaching a new lvl
        if (sheet.level < newLvl && newLvl != this.MAX_LVL) {
            //log
            discordClient.emit('sessionLog', 'levelUp', [characterName, newLvl]);

            discordClient.emit('gameEvent', 'levelUp', [characterName, message.member.displayHexColor]);
        }
    },
};