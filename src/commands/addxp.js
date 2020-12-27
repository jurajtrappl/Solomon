const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { searchingObjType, NotFoundError } = require('../err/errors');

module.exports = {
    name: 'addxp',
    description: 'Modify players XP count - DM only.',
    args: true,
    MAX_LVL: 20,
    async execute(message, args, mongo, discordClient) {
        if (message.author.id == dmID) {
            ArgsValidator.checkCount(args, 2);

            const addXP = args[1];
            ArgsValidator.typeCheckOne(addXP, type.numeric);

            const characterName = args[0];
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

        } else {
            return await message.reply('This command is not allowed for players.');
        }
    },
};