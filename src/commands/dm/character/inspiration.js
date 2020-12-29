const { database } = require('../../../../settings.json');
const { NotFoundError, searchingObjType } = require('../../../err/errors');

module.exports = {
    name: 'inspiration',
    args: true,
    description: 'Give an inspiration to one of the players.',
    async execute(_message, args, mongo, discordClient) {
        const characterName = args[0];
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
        const reason = args.slice(1).join(' ');
        discordClient.emit('sessionLog', 'inspiration', [characterName, reason]);
    },
};