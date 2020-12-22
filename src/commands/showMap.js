const settings = require('../../settings.json');

module.exports = {
    name: 'showMap',
    args: false,
    description: 'Shows a combat map.',
    mapToMessage: function(parsedMap) {
        let row, col;
        let mapAsMessage = '';

        for(row = 0; row < parsedMap.dimensions.height; row++) {
            for(col = 0; col < parsedMap.dimensions.width; col++) {
                mapAsMessage += parsedMap['tiles'][row][col].value;
            }
            mapAsMessage += '\n';
        }

        return mapAsMessage;
    },
    async execute(message, _args, db, _client) {
        //get map
        let resultMap = await db
            .collection(settings.database.collections.data)
            .find({
                name: 'Combat',
            })
            .toArray();
        let map = resultMap[0]['content']['map'];

        let parsedMap = JSON.parse(map);

        return await message.channel.send("```" + this.mapToMessage(parsedMap) + "```");
    }
}