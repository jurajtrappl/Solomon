const { ArgsValidator } = require('../../../err/argsValidator');
const { database } = require('../../../../settings.json');
const { DiceRoller } = require('../../../rolls/diceRoller');
const { makeHealEmbed } = require('../../../output/embed');
const { NotFoundError } = require('../../../err/errors');

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
    async execute(message, args, mongo, discordClient) {
        ArgsValidator.checkCount(args, 2);

        let expr = '';
        let title = '';

        const healItem = args[1];
        if (Object.keys(this.healingPotions).includes(healItem)) {
            expr = this.healingPotions[args[1]];
            title = `Using potion: ${args[1]}`;
        } else {
            expr = args.slice(1).join('');
            title = 'Healing using an expression';
        }

        const dice = new DiceRoller(expr);
        const heal = dice.roll();

        //get character sheet
        const characterName = args[0];
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.character, characterName);
        }

        let newCurrentHp = sheet.currentHP + Number(heal.total);
        if (newCurrentHp > sheet.maxHP) {
            newCurrentHp = sheet.maxHP;
        }

        const newHP = {
            $set: {
                currentHP: newCurrentHp,
            },
        };

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHP);

        await message.reply({
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

        //log
        discordClient.emit('sessionLog', 'heal', [ characterName, heal.total, healItem, newCurrentHp ]);
    },
};
