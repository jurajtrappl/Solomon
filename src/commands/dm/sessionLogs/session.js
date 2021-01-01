const { database } = require('../../../../settings.json');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'session',
    description: 'Emits an event that prints information about start of an session.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'characterNames' }, {type: 'string'}]
        ]
    },
    async execute(_message, [characterNamesArg, flag], mongo, discordClient) {
        const characterNames = characterNamesArg.split(',');

        //get time data
        const locations = {};
        const dateTimes = {};
        for (const characterName of characterNames) {
            const timeData = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!timeData) {
                throw new NotFoundError(searchingObjType.time, characterName);
            }

            locations[characterName] = timeData.location;
            dateTimes[characterName] = timeData.datetime;
        }

        discordClient.emit('sessionLog', 'session', [flag, characterNames, locations, dateTimes]);
    },
};
