const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');
const { makeSheetEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'profile',
    args: false,
    description: 'Shows a players character sheet.',
    async execute(message, _args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }

        return await message.reply({
            embed: makeSheetEmbed(message.member.displayHexColor, sheet)
        });
    }
};