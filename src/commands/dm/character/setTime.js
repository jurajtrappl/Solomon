const { ArgsValidator, type } = require('../../../err/argsValidator');
const { database } = require('../../../../settings.json');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'setTime',
    description: 'Set date and time for one or all of characters.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'characterNames' }, { type: 'timeArg' }, { type: 'number' }]
        ]
    },
    dependencies: [
        { type: 'timeDatas' }
    ],
    async execute(_message, [characterNamesArg, timeArg, timeAmount], mongo, discordClient) {
        const charactersTimeData = [];

        const characterNames = characterNamesArg.split(',');
        for (const characterName of characterNames) {
            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new NotFoundError(searchingObjType.time, characterName);
            }

            charactersTimeData.push(time);
        }

        //adjust the datetime property for each time data
        let currentDateTime = {};
        const logTimes = {};
        for (const characterTime of charactersTimeData) {
            currentDateTime = new Date(characterTime.datetime);

            if (timeArg == 'm') {
                currentDateTime.setMinutes(
                    currentDateTime.getMinutes() + timeAmount
                );
            } else if (timeArg == 'h') {
                currentDateTime.setHours(
                    currentDateTime.getHours() + timeAmount
                );
            }

            const newDateTimeValue = {
                $set: {
                    datetime: currentDateTime,
                }
            };

            logTimes[characterTime.characterName] = currentDateTime;
            await mongo.updateOne(database.collections.time, { characterName: characterTime.characterName }, newDateTimeValue);
        }

        //log
        discordClient.emit('sessionLog', 'setTime', [characterNames, logTimes]);
    },
};