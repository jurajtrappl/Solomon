const settings = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../help');
const { ExpressionDice } = require('../dice.js');
const { normalRollEmbed } = require('../embed.js');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
    async execute(message, args, db) {
        if (askedForHelp(args)) {
            printHelpEmbed(this.name, message, db);
            return;
        }

        //get character name
        let resultName = await db.collection(settings.database.collections.players).find({
            discordID: message.author.id
        }).toArray();
        let characterName = resultName[0].characters[0];

        const expr = args.map(a => a.trim()).join('');
        const expressionDice = new ExpressionDice(expr);

        return await message.reply({
            embed: normalRollEmbed(characterName, message.member.displayHexColor, expr, 'Expression roll', expressionDice.roll())
        });
    }
}