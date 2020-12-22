const settings = require('../../../settings.json');
const { color } = require('../../colorize.js');
const { sheetEmbed } = require('../../embed.js');

module.exports = {
    name: "sheet",
    args: false,
    description: "Shows players character sheet.",
    async execute(message, args, db) {
        if (args[0] == "help") {
            db
                .collection(settings.database.collections.helpEmbeds)
                .find({
                    commandName: this.name,
                })
                .toArray(async (err, result) => {
                    if (err) throw err;
                    return await message.reply({
                        embed: result[0],
                    });
                });
        } else {
            //get character name
            let resultName = await db
                .collection(settings.database.collections.players)
                .find({
                    discordID: message.author.id,
                })
                .toArray();
            let characterName = resultName[0]["characters"][0];

            let resultSheet = await db
                .collection(settings.database.collections.characters)
                .find({
                    characterName: characterName,
                })
                .toArray();
            let sheet = resultSheet[0];

            return await message.reply({
                embed: sheetEmbed(color(message.author.id, db), sheet)
            });
        }
    }
};