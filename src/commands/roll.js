const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../rolls/dice');
const { makeNormalRollEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
    async execute(message, args, mongo, _discordClient) {
        const rollExpression = args.map(a => a.trim()).join('');
        ArgsValidator.typeCheckOne(rollExpression, type.rollExpression);

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        const expressionDice = new ExpressionDice(rollExpression);

        return await message.reply({
            embed: makeNormalRollEmbed(characterName, message.member.displayHexColor, rollExpression, 'Expression roll', expressionDice.roll())
        });
    }
}