const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');
const { Map } = require('../map.js');

module.exports = {
    name: 'createMap',
    args: false,
    description: 'Creates a map for combat with the specified dimensions.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //check arguments
        if (args.length != 2) {
            return await message.reply('Incorrect number of arguments.');
        }
        //check if args are nums
        if (Number(args[0] <= 1) || Number(args[1]) <= 1) {
            return await message.reply('Size of dimensions are out of bounds.');
        }

        //add borders
        const dimensions = {
            width: Number(args[0]) + 2,
            height: Number(args[1]) + 2
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