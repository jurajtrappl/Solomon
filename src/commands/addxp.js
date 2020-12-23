const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { askedForHelp, printHelpEmbed } = require('../help');

module.exports = {
    name: 'addxp',
    description: 'Modify players XP count - DM only.',
    args: true,
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        if (message.author.id == dmID) {
            const characterName = args[0];
            const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
            if (!sheet) {
                throw new Error(`${characterName} has not a character sheet`);
            }

            const characterAdvancement = await mongo.tryFind(database.collections.data, { name: 'CharacterAdvancement' });
            if (!characterAdvancement) {
                throw new Error(`There is not a 'Character Advancement'.`);
            }

            const addXP = args[1];
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