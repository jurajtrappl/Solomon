const { database } = require('../../../../settings.json');
const { makeSpellEmbed } = require('../../../output/embed');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'spell',
    description: 'Shows an information about a spell.',
    args: {
        limitCount: false,
        specifics: []
    },
    async execute(message, [...spellNameArg], mongo, _discordClient) {
        const spellName = spellNameArg.join(' ');

        const spell = await mongo.tryFind(database.collections.spells, { name: spellName });
        if (!spell) {
            throw new NotFoundError(searchingObjType.dataFile, spellName);
        }

        return await message.reply({
            embed: makeSpellEmbed(message.member.displayHexColor, spell)
        });
    }
};