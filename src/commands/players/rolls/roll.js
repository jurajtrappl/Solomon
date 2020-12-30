const { database } = require('../../../../settings.json');
const { DiceRoller } = require('../../../rolls/diceRoller');
const { makeNormalRollEmbed } = require('../../../output/embed');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'roll',
    description: 'Rolling dices for D&D.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'rollExpression' }]
        ]
    },
    dependencies: [],
    async execute(message, [...rollExpressionArgs], mongo, _discordClient) {
        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        const rollExpression = rollExpressionArgs.join('');
        const dice = new DiceRoller(rollExpression);
        const rollResult = dice.roll();

        return await message.reply({
            embed: makeNormalRollEmbed(characterName, message.member.displayHexColor, rollExpression, 'Expression roll', rollResult)
        });
    }
}