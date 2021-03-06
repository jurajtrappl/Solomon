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
            [{ type: 'rollExpression' }]
        ]
    },
    async execute(message, [ healExpression ], mongo, discordClient) {
        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
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
