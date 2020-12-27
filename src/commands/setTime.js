const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'setTime',
    args: true,
    description: 'Set current date, time and location.',
    async execute(message, args, mongo, _discordClient) {
        if (message.author.id == dmID) {
            let characterTimes = [];
            const quantityArg = args[0];

            //get all required time data
            if (quantityArg == 'all') {
                characterTimes = await mongo.findAll(database.collections.time);
            } else {
                const characterName = args[0];
                const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
                if (!time) {
                    throw new NotFoundError(searchingObjType.time, characterName);
                }

                characterTimes.push(time);
            }

            const timeArg = args[1];

            //first try to solve the location
            if (timeArg === 'l') {
                const newLocation = args.slice(2).join(' ');
                const newLocationValue = {
                    $set: {
                        location: newLocation
                    }
                };

                if (quantityArg === 'all') {
                    return await mongo.updateAll(database.collections.time, newLocationValue);
                } else {
                    return await mongo.updateOne(database.collections.time, { characterName: [characterTimes].characterName }, newLocationValue);
                }
            }

            //its not the location, we expect numeric argument
            ArgsValidator.checkCount(args, 3);
            let amount = args[2];
            ArgsValidator.typeCheckOne(amount, type.numeric);
            amount = Number(args[2]);

            //adjust the datetime property for each time data
            for (let characterTime of characterTimes) {
                let currentDateTime = new Date(characterTime.datetime);

                if (timeArg == 'm') {
                    currentDateTime.setMinutes(
                        currentDateTime.getMinutes() + amount
                    );
                } else if (timeArg == 'h') {
                    currentDateTime.setHours(
                        currentDateTime.getHours() + amount
                    );
                }

                const newDateTimeValue = {
                    $set: {
                        datetime: currentDateTime,
                    },
                };

                await mongo.updateOne(database.collections.time, { characterName: characterTime.characterName }, newDateTimeValue);
            }


        }
    },
};