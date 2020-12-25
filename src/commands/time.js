const { database } = require('../../settings.json');
const { makeTimeEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'time',
    args: false,
    description: 'Show characters current date, time, location and the time of the last long rest.',
    async execute(message, _args, mongo, _discordClient) {
        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
        if (!time) {
            throw new NotFoundError(searchingObjType.time, characterName);
        }

        return await message.reply({
            embed: makeTimeEmbed(message.member.displayHexColor, time),
        });
    },
};