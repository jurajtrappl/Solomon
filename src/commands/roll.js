const dice = require('../dice.js');
const { helpEmbed, normalRollEmbed } = require('../embed.js');
const settings = require('../../settings.json');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
    async execute(message, args, db) {
        if (args[0] === 'help') {
            db.collection(settings.database.collections.helpEmbeds).find({
                commandName: this.name
            }).toArray(async (err, result) => {
                if (err) throw err;
                return await message.reply({
                    embed: helpEmbed(message.member.displayHexColor, result[0]),
                });
            });
        } else {
            //get character name
            let resultName = await db.collection(settings.database.collections.players).find({
                discordID: message.author.id
            }).toArray();
            let characterName = resultName[0]["characters"][0];

            const expr = args.map(a => a.trim()).join('');
            const expressionDice = new dice.ExpressionDice(expr);

            return await message.reply({
                embed: normalRollEmbed(characterName, message.member.displayHexColor, expr, 'Expression roll', expressionDice.roll())
            });
        }
    }
}