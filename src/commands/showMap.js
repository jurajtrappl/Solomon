const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');

module.exports = {
    name: 'showMap',
    args: false,
    description: 'Shows a combat map.',
    mapToMessage: function(parsedMap) {
        let row, col;
        let mapAsMessage = '';

        for(row = 0; row < parsedMap.dimensions.height; row++) {
            for(col = 0; col < parsedMap.dimensions.width; col++) {
                mapAsMessage += parsedMap.tiles[row][col].value;
            }
            mapAsMessage += '\n';
        }

        return mapAsMessage;
    },
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get map
        const map = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!map) {
            throw new Error('Map does not exist.');
        }
        let parsedMap = JSON.parse(map);

        return await message.channel.send('```' + this.mapToMessage(parsedMap) + '```');
    }
}