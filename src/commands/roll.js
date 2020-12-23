const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../rolls/dice');
const { makeNormalRollEmbed } = require('../output/embed');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
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

        const expr = args.map(a => a.trim()).join('');
        const expressionDice = new ExpressionDice(expr);

        return await message.reply({
            embed: makeNormalRollEmbed(characterName, message.member.displayHexColor, expr, 'Expression roll', expressionDice.roll())
        });
    }
}