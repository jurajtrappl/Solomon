const settings = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../help');
const { sheetEmbed } = require('../embed.js');

module.exports = {
    name: 'sheet',
    args: false,
    description: 'Shows players character sheet.',
    async execute(message, args, db) {
        if (askedForHelp(args)) {
            printHelpEmbed(this.name, message, db);
            return;
        }

        //get character name
        let resultName = await db
            .collection(settings.database.collections.players)
            .find({
                discordID: message.author.id,
            })
            .toArray();
        let characterName = resultName[0].characters[0];

        let resultSheet = await db
            .collection(settings.database.collections.characters)
            .find({
                characterName: characterName,
            })
            .toArray();
        let sheet = resultSheet[0];

        return await message.reply({
            embed: sheetEmbed(message.member.displayHexColor, sheet)
        });
    }
};