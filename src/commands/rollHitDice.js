const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { DiceRoller } = require('../rolls/diceRoller');
const { makeHitDiceEmbed } = require('../output/embed');
const { Sheet } = require('../character/sheet');
const { prepareHitDiceCheck } = require('../rolls/rollUtils');

module.exports = {
    name: 'rhd',
    args: true,
    description: 'Spends the specified amount of hit dices.',
    async execute(message, args, mongo, _discordClient) {
        ArgsValidator.checkCount(args, 1);
        let hitDiceCountToSpend = args[0];
        ArgsValidator.typeCheckOne(hitDiceCountToSpend, type.numeric);

        hitDiceCountToSpend = Number(args[0]);
        if (hitDiceCountToSpend <= 0) {
            throw new NotEnoughError(`hit dices to roll`, hitDiceCountToSpend, 1);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.character, characterName);
        }
        const characterSheet = new Sheet(sheet);

        const hitDiceCount = sheet.hitDice.count;
        const hitDiceSpent = sheet.hitDice.spent;

        if (hitDiceCountToSpend + hitDiceSpent > hitDiceCount) {
            return await message.reply(`You can't use that many hit dices. (${hitDiceCount} hit dice${(hitDiceCount != 1) ? 's' : ''} left)`);
        }

        //create the roll expression
        const constitutionModifier = characterSheet.modifier(characterSheet.abilityScore('Constitution'));
        const hitDiceType = sheet.hitDice.type;
        const hitDicesLeft = hitDiceCount - hitDiceSpent - hitDiceCountToSpend;

        const check = prepareHitDiceCheck(hitDiceCountToSpend, hitDiceType, constitutionModifier);
        const rollResult = check.dice.roll();

        //update the spent hit dices and current hp
        let newHP = Number(sheet.currentHP) + Number(rollResult.total);
        if (newHP > Number(sheet.maxHP)) {
            newHP = Number(sheet.maxHP);
        }

        const newHitDiceSpentValue = {
            $set: {
                hitDice: {
                    type: sheet.hitDice.type,
                    spent: hitDiceSpent + hitDiceCountToSpend,
                    count: hitDiceCount - hitDiceCountToSpend
                },
                currentHP: newHP
            }
        }

        //await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHitDiceSpentValue);

        return await message.reply({
            embed: makeHitDiceEmbed(characterName, message.member.displayHexColor, check.expression, rollResult, hitDiceCountToSpend, hitDicesLeft)
        });
    }
}