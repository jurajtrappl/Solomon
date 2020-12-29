const { ArgsValidator, type } = require('../../../err/argsValidator');
const { database } = require('../../../../settings.json');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'setTime',
    args: true,
    description: 'Set date and time for one or all of characters.',
    async execute(message, args, mongo, discordClient) {
        let charactersTimeData = [];
        const quantityArg = args[0];

        //get all required time data
        if (quantityArg == 'all') {
            charactersTimeData = await mongo.findAll(database.collections.time);
        } else {
            const characterName = args[0];
            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new NotFoundError(searchingObjType.time, characterName);
            }

            charactersTimeData.push(time);
        }

        //its not the location, we expect numeric argument
        ArgsValidator.checkCount(args, 3);
        let amount = args[2];
        ArgsValidator.typeCheckOne(amount, type.numeric);
        amount = Number(args[2]);

        //adjust the datetime property for each time data
        const timeArg = args[1];
        let currentDateTime = {};
        let logTimes = {};
        for (let characterTime of charactersTimeData) {
            currentDateTime = new Date(characterTime.datetime);

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

            logTimes[characterTime.characterName] = currentDateTime;
            //await mongo.updateOne(database.collections.time, { characterName: characterTime.characterName }, newDateTimeValue);
        }

        //log
        const characterNames = [];
        charactersTimeData.map(timeData => characterNames.push(timeData.characterName));
        discordClient.emit('sessionLog', 'setTime', [characterNames, logTimes]);
    },
};