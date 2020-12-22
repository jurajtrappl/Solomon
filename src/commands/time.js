const settings = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../help');
const { dmID } = require("../../auth.json");
const { timeEmbed } = require('../embed.js');

module.exports = {
    name: "time",
    args: true,
    description: "Set current date, time and location.",
    async execute(message, args, db, _client) {
        if (askedForHelp(args)) {
            printHelpEmbed(this.name, message, db);
            return;
        }

        if (message.author.id == dmID) {
            //DM command
            let resultTime = await db
                .collection(settings.database.collections.time)
                .find({
                    characterName: args[0],
                })
                .toArray();

            if (args[1] == "l") {
                const newLocation = args.slice(2).join(' ');
                let newLocationValue = {
                    $set: {
                        location: newLocation
                    }
                };

                await db.collection(settings.database.collections.time).updateOne({
                    characterName: args[0]
                }, newLocationValue, (err) => {
                    if (err) throw err;
                });

                return;
            } else {
                let currentDateTime = new Date(resultTime[0]["datetime"]);

                if (args[1] == "m") {
                    currentDateTime.setMinutes(
                        currentDateTime.getMinutes() + Number(args[2])
                    );
                } else if (args[1] == "h") {
                    currentDateTime.setHours(
                        currentDateTime.getHours() + Number(args[2])
                    );
                }

                const newDateTimeValue = {
                    $set: {
                        datetime: currentDateTime,
                    },
                };

                await db.collection(settings.database.collections.time).updateOne({
                    characterName: args[0],
                },
                    newDateTimeValue,
                    (err) => {
                        if (err) throw err;
                    }
                );
            }
        } else {
            //Players command
            //get character name
            let resultName = await db
                .collection(settings.database.collections.players)
                .find({
                    discordID: message.author.id,
                })
                .toArray();
            let characterName = resultName[0]["characters"][0];

            let resultTime = await db
                .collection(settings.database.collections.time)
                .find({
                    characterName: characterName,
                })
                .toArray();
            let time = resultTime[0];

            return await message.reply({
                embed: timeEmbed(message.member.displayHexColor, time),
            });
        }
    },
};