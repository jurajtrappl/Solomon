const dice = require('../../dice.js');
const embed = require("../../../src/embed.js");
const settings = require("../../../settings.json");

module.exports = {
    name: "heal",
    aliases: [ "Heal" ],
    args: true,
    description: "Heals a character.",
    healingPotions: {
        "Healing": "2d4+2",
        "Greater": "4d4+4",
        "Superior": "8d4+8",
        "Supreme": "10d4+20"
    },
    async execute(message, args, db, _client) {
        if (args[0] === "help" || args.length == 0) {
            db.collection(settings.database.collections.helpEmbeds)
                .find({
                    commandName: this.name,
                })
                .toArray(async (err, result) => {
                    if (err) throw err;
                    return await message.reply({
                        embed: result[0],
                    });
                });
        } else if (args[0] == 'potions') {
            return await message.reply({ 
                embed: embed.objectEmbed(this.healingPotions, 'List of healing potions')
            });
        } else {
            let expr = '';
            let title = '';

            if (Object.keys(this.healingPotions).includes(args[0])) {
                expr = this.healingPotions[args[0]];
                title = `Using potion: ${args[0]}`;
            } else {
                const argsExpr = args.map(a => a.trim()).join('');
                if (dice.isRollExpression(argsExpr)) {
                    expr = argsExpr;
                    title = 'Healing using an expression';
                } else {
                    return await message.reply(settings.errorCommandExecuteMessage);
                }
            }

            const expressionDice = new dice.ExpressionDice(expr);
            const heal = expressionDice.roll();

            //get character name
            let resultName = await db
                .collection(settings.database.collections.players)
                .find({
                    discordID: message.author.id,
                })
                .toArray();
            let characterName = resultName[0]["characters"][0];

            //get character sheet
            let resultSheet = await db
                .collection(settings.database.collections.characters)
                .find({
                    characterName: characterName,
                })
                .toArray();
            let sheet = resultSheet[0];

            let newCurrentHp = sheet["currentHP"] + Number(heal.totalRoll);
            if (newCurrentHp > sheet["maxHP"]) {
                newCurrentHp = sheet["maxHP"];
            }

            const newValues = {
                $set: {
                    currentHP: newCurrentHp,
                },
            };

            await db.collection(settings.database.collections.characters).updateOne(
                {
                    characterName: characterName,
                },
                newValues,
                (err) => {
                    if (err) throw err;
                }
            );

            return await message.reply({ 
                embed: embed.healEmbed(characterName, expr, title, heal, newCurrentHp, sheet["maxHP"]) 
            });
        }
    },
};
