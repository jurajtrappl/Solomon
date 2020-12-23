const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');
const { makeSheetEmbed } = require('../embed');

module.exports = {
    name: 'sheet',
    args: false,
    description: 'Shows players character sheet.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new Error(`You do not have a character.`);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new Error(`${characterName} has not a character sheet`);
        }

        return await message.reply({
            embed: makeSheetEmbed(message.member.displayHexColor, sheet)
        });
    }
};