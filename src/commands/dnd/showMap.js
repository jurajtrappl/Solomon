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

        //debug purpose
        return await message.channel.send("```" + map['message'] + "```");
    }
}