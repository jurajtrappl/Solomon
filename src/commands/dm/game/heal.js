const { database } = require('../../../../settings.json');
const { DiceRoller } = require('../../../rolls/diceRoller');
const { makeHealEmbed } = require('../../../output/embed');
const { NotFoundError } = require('../../../err/errors');

module.exports = {
    name: 'heal',
    description: 'Heals a character.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'characterName' }, { type: 'rollExpression' }]
        ]
    },
    healingPotions: {
        Healing: '2d4+2',
        Greater: '4d4+4',
        Superior: '8d4+8',
        Supreme: '10d4+20',
    },
    async execute(message, [ characterName, healExpression ], mongo, discordClient) {
        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.character, characterName);
        }

        const dice = new DiceRoller(healExpression);
        const heal = dice.roll();

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
                healExpression,
                'Healing using an expression',
                heal,
                newCurrentHp,
                sheet.maxHP
            ),
        });

        //log
        discordClient.emit('sessionLog', 'heal', [characterName, heal.total, healExpression, newCurrentHp]);
    },
};
