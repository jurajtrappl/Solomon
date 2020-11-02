const dice = require('../../src/dice.js');
const embed = require('../../src/embed.js');

module.exports = {
    name: 'rhd',
    args: true,
    description: 'Rolling hit dices.',
    async execute(message, args, db, _client) {
        if (args[0] === 'help') {
            return await message.reply({
                embed: embed.getHelpEmbed(dbClient, this.name)
            });
        } else {
            if (isNaN(args[0])) {
                return await message.reply('Invalid number of hit dices.');
            } else if (args[0] > 0) {
                //get character name
                let resultName = await db.collection("players").find({
                    discordID: message.author.id
                }).toArray();
                const characterName = resultName[0]["characters"][0];

                //get character sheet
                let resultSheet = await db.collection("characters").find({
                    characterName: characterName
                }).toArray();
                const sheet = resultSheet[0];

                const hitDiceCount = sheet["hitDice"]["count"];
                const hitDiceSpent = Number(sheet["hitDice"]["spent"]);

                if (Number(args[0]) + hitDiceSpent > hitDiceCount) {
                    return await message.reply(`You can't use that many hit dices. (${hitDiceCount} hit dice${(hitDiceCount != 1) ? 's' : ''} left)`);
                }

                //create the roll expression
                const constitutionModifier = Math.floor((sheet['abilities']['Constitution'] - 10) / 2);
                const hitDiceType = sheet['hitDice']['type'];
                const hitDicesToRoll = args[0];
                const expr = `${hitDicesToRoll}d${hitDiceType}+${hitDicesToRoll * constitutionModifier}`;
                const hitDicesLeft = hitDiceCount - hitDiceSpent - args[0];

                try {
                    const expressionDice = new dice.ExpressionDice(expr);
                    const rollResult = expressionDice.roll();

                    //update the spent hit dices and current hp
                    let newHP = Number(sheet["currentHP"]) + Number(rollResult.totalRoll);
                    if (newHP > Number(sheet["maxHP"])) {
                        newHP = Number(sheet["maxHP"]);
                    }
            
                    const newHitDiceSpentValue = {
                        $set: {
                            hitDice: {
                                type: sheet["hitDice"]["type"],
                                spent: hitDiceSpent + Number(args[0]),
                                count: hitDiceCount - Number(args[0])
                            },
                            currentHP: newHP
                        }
                    }

                    db.collection("characters").updateOne({
                            characterName: characterName
                        }, newHitDiceSpentValue,
                        (err) => {
                            if (err) throw err;
                        });

                    const rollEmbed = embed.hitDiceEmbed(characterName, expr, rollResult, hitDicesToRoll, hitDicesLeft);

                    return await message.reply({
                        embed: rollEmbed
                    });
                } catch (err) {
                    return await message.reply(err);
                }
            } else {
                return await message.reply('ty beťar jeden :smile:.')
            }
        }
    }
}