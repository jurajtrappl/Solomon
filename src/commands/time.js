const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { makeTimeEmbed } = require('../embed.js');

module.exports = {
    name: 'time',
    args: true,
    description: 'Set current date, time and location.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        if (message.author.id == dmID) {
            //DM command
            //get character time data, to check if long rest is available
            const characterName = args[0];
            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new Error(`${characterName} does not have time data.`);
            }

            if (args[1] == 'l') {
                const newLocation = args.slice(2).join(' ');
                const newLocationValue = {
                    $set: {
                        location: newLocation
                    }
                };

                return await mongo.updateOne(database.collections.time, { characterName: characterName }, newLocationValue);
            } else {
                let currentDateTime = new Date(time.datetime);

                if (args[1] == 'm') {
                    currentDateTime.setMinutes(
                        currentDateTime.getMinutes() + Number(args[2])
                    );
                } else if (args[1] == 'h') {
                    currentDateTime.setHours(
                        currentDateTime.getHours() + Number(args[2])
                    );
                }

                const newDateTimeValue = {
                    $set: {
                        datetime: currentDateTime,
                    },
                };

                return await mongo.updateOne(database.collections.time, { characterName: characterName }, newDateTimeValue);
            }
        } else {
            //Players command
            //get character name
            const characterName = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
            if (!characterName) {
                throw new Error(`You do not have a character.`);
            }

            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new Error(`${characterName} does not have time data.`);
            }

            return await message.reply({
                embed: makeTimeEmbed(message.member.displayHexColor, time),
            });
        }
    },
};