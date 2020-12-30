const { database } = require('../../../../settings.json');
const { OutOfRangeError } = require('../../../err/errors');
const { Map } = require('../../../combat/map');

module.exports = {
    name: 'createMap',
    description: 'Creates a map for combat with the specified dimensions.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'number' }, { type: 'number' }]
        ]
    },
    async execute(_message, [width, height], mongo, _discordClient) {
        if (width <= 1 || width >= 44) {
            throw new OutOfRangeError('Width', 2, 43);
        }

        if (height <= 1 || height >= 44) {
            throw new OutOfRangeError('Height', 2, 43);
        }

        //add borders
        const dimensions = {
            width: Number(width) + 2,
            height: Number(height) + 2
        };

        //update map
        const newMap = {
            $set: {
                'content.map': JSON.stringify(new Map(dimensions)),
                'content.combatants': [],
                'content.initiativeOrder': {}
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat' }, newMap);
    }
}