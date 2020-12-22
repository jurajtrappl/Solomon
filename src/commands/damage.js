const settings = require("../../settings.json");
const { helpEmbed } = require('../embed.js');

module.exports = {
    name: "damage",
    args: true,
    description: "Damaging characters.",
    isDead: function (currentHP, maxHP) {
        return currentHP <= -maxHP;
    },
    isKnocked: function (currentHP, maxHP) {
        return currentHP < 0 && !this.isDead(currentHP, maxHP);
    },
    async execute(message, args, db, client) {
        if (args[0] === "help") {
            db.collection(settings.database.collections.helpEmbeds)
                .find({
                    commandName: this.name,
                })
                .toArray(async (err, result) => {
                    if (err) throw err;
                    return await message.reply({
                        embed: helpEmbed(message.member.displayHexColor, result[0]),
                    });
                });
        } else {
            //get character sheet
            let resultSheet = await db
                .collection(settings.database.collections.characters)
                .find({
                    characterName: args[0],
                })
                .toArray();
            let sheet = resultSheet[0];

            if (Number(args[1]) < 0) {
                return await message.reply("You sneaky thing.");
            }

            const newCurrentHP = sheet["currentHP"] - Number(args[1]);
            let changedStatus = false;
            if (this.isKnocked(newCurrentHP, sheet["maxHP"])) {
                changedStatus = true;
                client.emit('playerKnocked', args[0]);
            } else if (this.isDead(newCurrentHP, sheet["maxHP"])) {
                changedStatus = true;
                client.emit('playerDead', args[0]);
            }

            const newValues = {
                $set: {
                    currentHP: (changedStatus) ? 0 : newCurrentHP,
                },
            };

            await db.collection(settings.database.collections.characters).updateOne(
                {
                    characterName: args[0],
                },
                newValues,
                (err) => {
                    if (err) throw err;
                }
            );
        }
    },
};
