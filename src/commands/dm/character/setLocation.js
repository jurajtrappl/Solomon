const { database } = require('../../../../settings.json');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'setLocation',
    description: 'Set a new location for a character.',
    args: {
        limitCount: false,
        specifics: [
            [{ type: 'characterNames' }]
        ]
    },
    async execute(_message, [characterNamesArg, ...locationArgs], mongo, discordClient) {
        const charactersTimeData = [];

        const characterNames = characterNamesArg.split(',');
        for(const characterName of characterNames) {
            const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
            if (!time) {
                throw new NotFoundError(searchingObjType.time, characterName);
            }

            charactersTimeData.push(time);
        }

        const newLocation = locationArgs.join(' ');

        const newLocationValue = {
            $set: {
                location: newLocation
            }
        };

        for (const characterName of characterNames) {
            await mongo.updateOne(database.collections.time, { characterName: characterName }, newLocationValue);
        }

        //log
        discordClient.emit('sessionLog', 'setLocation', [characterNames, newLocation]);
    },
};