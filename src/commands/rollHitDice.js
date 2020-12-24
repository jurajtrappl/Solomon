const { ArgsValidator, type } = require('../err/argsValidator');
const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../rolls/dice');
const { makeHitDiceEmbed } = require('../output/embed');
const { Sheet } = require('../character/sheet');

module.exports = {
    name: 'rhd',
    args: true,
    description: 'Spends the specified amount of hit dices.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        ArgsValidator.CheckCount(args, 1);
        let hitDiceCountToSpent = args[0];
        ArgsValidator.TypeCheckOne(hitDiceCountToSpent, type.numeric);

        hitDiceCountToSpent = Number(args[0]);
        if (hitDiceCountToSpent <= 0) {
            throw new NotEnoughError(`hit dices to roll`, hitDiceCountToSpent, 1);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.character, characterName);
        }
        const characterSheet = new Sheet(sheet);

        const hitDiceCount = sheet.hitDice.count;
        const hitDiceSpent = sheet.hitDice.spent;

        if (hitDiceCountToSpent + hitDiceSpent > hitDiceCount) {
            return await message.reply(`You can't use that many hit dices. (${hitDiceCount} hit dice${(hitDiceCount != 1) ? 's' : ''} left)`);
        }

        //create the roll expression
        const constitutionModifier = characterSheet.modifier(characterSheet.abilityScore('Constitution'));
        const hitDiceType = sheet.hitDice.type;
        const expr = `${hitDiceCountToSpent}d${hitDiceType}+${hitDiceCountToSpent * constitutionModifier}`;
        const hitDicesLeft = hitDiceCount - hitDiceSpent - hitDiceCountToSpent;

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
                    spent: hitDiceSpent + hitDiceCountToSpent,
                    count: hitDiceCount - hitDiceCountToSpent
                },
                currentHP: newHP
            }
        }

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHitDiceSpentValue);

        return await message.reply({
            embed: makeHitDiceEmbed(characterName, message.member.displayHexColor, expr, rollResult, hitDicesToRoll, hitDicesLeft)
        });
    }
}