const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { makeTimeEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'time',
    args: true,
    description: 'Set current date, time and location.',
    async execute(message, args, mongo, _discordClient) {
        if (message.author.id == dmID) {
            //DM command
            //get character time data, to check if long rest is available
            const characterName = args[0];
            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new NotFoundError(searchingObjType.time, characterName);
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
            const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
            if (!playerData) {
                throw new NotFoundError(searchingObjType.player, message.author.id);
            }
            const [characterName] = playerData.characters;

            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new NotFoundError(searchingObjType.time, characterName);
            }

            return await message.reply({
                embed: makeTimeEmbed(message.member.displayHexColor, time),
            });
        }
    },
};