const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { searchingObjType, NotFoundError } = require('../err/errors');

module.exports = {
    name: 'addxp',
    description: 'Modify players XP count - DM only.',
    args: true,
    async execute(message, args, mongo, _discordClient) {
        if (message.author.id == dmID) {
            ArgsValidator.CheckCount(args, 2);

            const addXP = args[1];
            ArgsValidator.TypeCheckOne(addXP, type.numeric);

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
        } else {
            return await message.reply('This command is not allowed for players.');
        }
    },
};