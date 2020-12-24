const { ArgsValidator } = require('../err/argsValidator');
const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');
const { ExpressionDice, isRollExpression } = require('../rolls/dice');
const { makeHealEmbed } = require('../output/embed');
const { NotFoundError, InvalidRollExpressionError } = require('../err/errors');

module.exports = {
    name: 'heal',
    args: true,
    description: 'Heals a character.',
    healingPotions: {
        Healing: '2d4+2',
        Greater: '4d4+4',
        Superior: '8d4+8',
        Supreme: '10d4+20',
    },
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        ArgsValidator.CheckCount(args, 2);

        let expr = '';
        let title = '';

        if (Object.keys(this.healingPotions).includes(args[1])) {
            expr = this.healingPotions[args[1]];
            title = `Using potion: ${args[1]}`;
        } else {
            const argsExpr = args.slice(1).map((a) => a.trim()).join('');
            if (isRollExpression(argsExpr)) {
                expr = argsExpr;
                title = 'Healing using an expression';
            } else {
                throw new InvalidRollExpressionError(expr);
            }
        }

        const expressionDice = new ExpressionDice(expr);
        const heal = expressionDice.roll();

        //get character sheet
        const characterName = args[0];
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.character, characterName);
        }

        let newCurrentHp = sheet.currentHP + Number(heal.totalRoll);
        if (newCurrentHp > sheet.maxHP) {
            newCurrentHp = sheet.maxHP;
        }

        const newHP = {
            $set: {
                currentHP: newCurrentHp,
            },
        };

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHP);

        return await message.reply({
            embed: makeHealEmbed(
                characterName,
                message.member.displayHexColor,
                expr,
                title,
                heal,
                newCurrentHp,
                sheet.maxHP
            ),
        });
    },
};
