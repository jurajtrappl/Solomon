const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../dice');
const { makeHealEmbed, makeObjectEmbed } = require('../embed');

module.exports = {
    name: 'heal',
    aliases: ['Heal'],
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

        if (args[0] == 'potions') {
            return await message.reply({
                embed: makeObjectEmbed(
                    message.member.displayHexColor,
                    this.healingPotions,
                    'List of healing potions'
                ),
            });
        } else {
            let expr = '';
            let title = '';

            if (Object.keys(this.healingPotions).includes(args[0])) {
                expr = this.healingPotions[args[0]];
                title = `Using potion: ${args[0]}`;
            } else {
                const argsExpr = args.map((a) => a.trim()).join('');
                if (dice.isRollExpression(argsExpr)) {
                    expr = argsExpr;
                    title = 'Healing using an expression';
                } else {
                    return await message.reply(settings.errorCommandExecuteMessage);
                }
            }

            const expressionDice = new ExpressionDice(expr);
            const heal = expressionDice.roll();

            //get character name
            const characterName = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
            if (!characterName) {
                throw new Error(`Discord user with the ID ${message.author.id} has not a character.`);
            }

            //get character sheet
            const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
            if (!sheet) {
                throw new Error(`${characterName} has not a character sheet`);
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
        }
    },
};
