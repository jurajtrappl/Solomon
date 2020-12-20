const settings = require('../../../settings.json');
const combat = require('../../map.js');

module.exports = {
    name: 'createMap',
    args: false,
    description: 'Creates a map for combat with the specified dimensions.',
    async execute(message, args, db, _client) {
        //check arguments
        if (args.length != 2) {
            return await message.reply('Nespravny pocet parametrov.');
        }
        // if (typeof(args[0]) !== 'number' || typeof(args[1]) !== 'number') {
        //     return await message.reply('niektorý z argumentov nie je číslo, ale som lenivý určiť, ktorý :smile:');
        // }
        if (Number(args[0] <= 0) || Number(args[1]) <= 0) {
            return await message.reply('načo by ti dačo také bolo? :smile:');
        }

        //create a new map
        const dimensions = {
            width: Number(args[0]) + 2,
            height: Number(args[1]) + 2
        };

        const newCombatMap = new combat.CombatMap(dimensions, true);

        //update db with the new map
        const newValues = {
            $set: {
                "content.map": newCombatMap.toObj()
            }
        };

        await db.collection(settings.database.collections.data).updateOne({
                name: 'Combat'
            },
            newValues),
            (err) => {
                if (err) throw err;
            };
    }
}