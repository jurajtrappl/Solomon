const { database } = require('../../../../settings.json');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'inspiration',
    description: 'Gives an inspiration to one of the players.',
    args: {
        limitCount: false,
        specifics: [
            [{ type: 'characterName' }]
        ]
    },
    async execute(_message, [ characterName, ...reasonArgs ], mongo, discordClient) {
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }

        const newSheetValue = {
            $set: {
                'inspiration': true
            }
        };

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newSheetValue);

        //log
        const reason = reasonArgs.join(' ');
        discordClient.emit('sessionLog', 'inspiration', [characterName, reason]);
    },
};