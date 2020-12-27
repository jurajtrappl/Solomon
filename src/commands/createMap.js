const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { OutOfRangeError } = require('../err/errors');
const { Map } = require('../combat/map');

module.exports = {
    name: 'createMap',
    args: true,
    description: 'Creates a map for combat with the specified dimensions.',
    async execute(_message, args, mongo, _discordClient) {
        ArgsValidator.checkCount(args, 2);

        ArgsValidator.typeCheckAll(args, [ type.numeric, type.numeric ]);

        const width = Number(args[0]);
        if (width <= 1 || width >= 44) {
            throw new OutOfRangeError('Width', 2, 43);
        }

        const height = Number(args[1]);
        if (height <= 1 || height >= 44) {
            throw new OutOfRangeError('Height', 2, 43);
        }

        //add borders
        const dimensions = {
            width: width + 2,
            height: height + 2
        };

        //update map
        const newMap = {
            $set: {
                'content.map': JSON.stringify(new Map(dimensions))
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat' }, newMap);
    }
}