const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../rolls/dice');
const { makeHitDiceEmbed } = require('../output/embed');
const { Sheet } = require('../character/sheet');

module.exports = {
    name: 'rhd',
    args: true,
    description: 'Rolling hit dices.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        if (isNaN(args[0])) {
            return await message.reply('Invalid number of hit dices.');
        } else if (args[0] > 0) {
            //get character name
            const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
            if (!playerData) {
                throw new Error(`You do not have a character.`);
            }
            const [characterName] = playerData.characters;

            //get character sheet
            const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
            if (!sheet) {
                throw new Error(`${characterName} has not a character sheet.`);
            }
            const characterSheet = new Sheet(sheet);

            const hitDiceCount = sheet.hitDice.count;
            const hitDiceSpent = Number(sheet.hitDice.spent);

            if (Number(args[0]) + hitDiceSpent > hitDiceCount) {
                return await message.reply(`You can't use that many hit dices. (${hitDiceCount} hit dice${(hitDiceCount != 1) ? 's' : ''} left)`);
            }

            //create the roll expression
            const constitutionModifier = characterSheet.modifier(characterSheet.abilityScore('Constitution'));
            const hitDiceType = sheet.hitDice.type;
            const hitDicesToRoll = Number(args[0]);
            const expr = `${hitDicesToRoll}d${hitDiceType}+${hitDicesToRoll * constitutionModifier}`;
            const hitDicesLeft = hitDiceCount - hitDiceSpent - hitDicesToRoll;

            try {
                const expressionDice = new ExpressionDice(expr);
                const rollResult = expressionDice.roll();

                //update the spent hit dices and current hp
                let newHP = Number(sheet.currentHP) + Number(rollResult.totalRoll);
                if (newHP > Number(sheet.maxHP)) {
                    newHP = Number(sheet.maxHP);
                }

                const newHitDiceSpentValue = {
                    $set: {
                        hitDice: {
                            type: sheet.hitDice.type,
                            spent: hitDiceSpent + Number(hitDicesToRoll),
                            count: hitDiceCount - Number(hitDicesToRoll)
                        },
                        currentHP: newHP
                    }
                }

                await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHitDiceSpentValue);

                return await message.reply({
                    embed: makeHitDiceEmbed(characterName, message.member.displayHexColor, expr, rollResult, hitDicesToRoll, hitDicesLeft)
                });
            } catch (err) {
                return await message.reply(err);
            }
        } else {
            return await message.reply('ty beťar jeden :smile:.')
        }
    }
}