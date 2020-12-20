const settings = require('../../../settings.json');

module.exports = {
    name: 'showMap',
    args: false,
    description: 'Shows a combat map.',
    async execute(message, _args, db, _client) {
        let resultMap = await db
            .collection(settings.database.collections.data)
            .find({
                name: 'Combat',
            })
            .toArray();
        let map = resultMap[0]['content']['map'];

        let mapMessage = '', row;
        for(row = 0; row < map.dimensions.height; row++) {
            mapMessage += `${map['tiles'][row].join('')}\n`;
        }

        return await message.channel.send("```" + mapMessage + "```");
    }
}