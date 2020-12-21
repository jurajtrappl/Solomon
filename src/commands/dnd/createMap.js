const settings = require('../../../settings.json');
const { Map } = require('../../map.js');

module.exports = {
    name: 'createMap',
    args: false,
    description: 'Creates a map for combat with the specified dimensions.',
    async execute(message, args, db, _client) {
        //check arguments
        if (args.length != 2) {
            return await message.reply('Nespravny pocet parametrov.');
        }
        //check if args are nums
        if (Number(args[0] <= 1) || Number(args[1]) <= 1) {
            return await message.reply('načo by ti dačo také bolo? :smile:');
        }

        //add borders
        const dimensions = {
            width: Number(args[0]) + 2,
            height: Number(args[1]) + 2
        };

        //update map
        await db.collection(settings.database.collections.data).updateOne({
                name: 'Combat'
            }, {
                $set: {
                    "content.map": JSON.stringify(new Map(dimensions))
                }
            },
                (err) => {
                    if (err) throw err;
                }
            );
    }
}