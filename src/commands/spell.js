const { database } = require('../../settings.json');
const { makeSpellEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'spell',
    args: false,
    description: 'Shows an information about a spell.',
    async execute(message, args, mongo, _discordClient) {
        const spellName = args.join(' ');

        const spell = await mongo.tryFind(database.collections.spells, { name: spellName });
        if (!spell) {
            throw new NotFoundError(searchingObjType.dataFile, spellName);
        }

        return await message.reply({
            embed: makeSpellEmbed(message.member.displayHexColor, spell)
        });
    }
};