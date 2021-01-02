const { database } = require('../../../../settings.json');
const { createGameDate } = require('../../../calendar/gameDate');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'setTime',
    description: 'Set date and time for specified characters.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'characterNames' }, { type: 'timeArg' }, { type: 'number' }]
        ]
    },
    async execute(_message, [characterNamesArg, timeArg, timeAmount], mongo, discordClient) {
        const charactersTimeData = {};

        const characterNames = characterNamesArg.split(',');
        for (const characterName of characterNames) {
            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new NotFoundError(searchingObjType.time, characterName);
            }

            charactersTimeData[characterName] = time;
        }

        //adjust the datetime property for each time data
        let currentDateTime = {};
        const logTimes = {};
        for (const [characterName, timeData] of Object.entries(charactersTimeData)) {
            currentDateTime = createGameDate(timeData.datetime);

            if (timeArg == 'm') {
                currentDateTime.addMinutes(Number(timeAmount));
            } else if (timeArg == 'h') {
                currentDateTime.addHours(Number(timeAmount));
            }

            const stringifiedNewTime = JSON.stringify(currentDateTime);

            const newDateTimeValue = {
                $set: {
                    datetime: stringifiedNewTime,
                }
            };

            logTimes[characterName] = stringifiedNewTime;
            await mongo.updateOne(database.collections.time, { characterName: characterName }, newDateTimeValue);
        }

        //log
        discordClient.emit('sessionLog', 'setTime', [logTimes]);
    },
};