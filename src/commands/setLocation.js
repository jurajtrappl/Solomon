const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'setLocation',
    args: true,
    description: 'Set a new location for a character.',
    async execute(message, args, mongo, discordClient) {
        if (message.author.id == dmID) {
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

            const newLocation = args.slice(1).join(' ');

            const newLocationValue = {
                $set: {
                    location: newLocation
                }
            };

            if (quantityArg === 'all') {
                await mongo.updateAll(database.collections.time, newLocationValue);
            } else {
                await mongo.updateOne(database.collections.time, { characterName: [charactersTimeData].characterName }, newLocationValue);
            }

            //log
            const characterNames = [];
            charactersTimeData.map(timeData => characterNames.push(timeData.characterName));
            discordClient.emit('sessionLog', 'setLocation', [ characterNames, newLocation ]);
        }
    },
};