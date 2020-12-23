const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../dice');
const { makeNormalRollEmbed } = require('../embed');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get character name
        const characterName = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!characterName) {
            throw new Error(`You do not have a character.`);
        }

        const expr = args.map(a => a.trim()).join('');
        const expressionDice = new ExpressionDice(expr);

        return await message.reply({
            embed: makeNormalRollEmbed(characterName, message.member.displayHexColor, expr, 'Expression roll', expressionDice.roll())
        });
    }
}