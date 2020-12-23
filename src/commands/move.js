const { askedForHelp, printHelpEmbed } = require('../help');
const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { moveObj } = require('../movement');

module.exports = {
    name: 'move',
    args: false,
    description: 'Move an object on the map.',
    swapPositions: function (tiles, currentPosition, newPosition) {
        let currentTile = tiles[currentPosition.x][currentPosition.y];
        tiles[currentPosition.x][currentPosition.y] = tiles[newPosition.x][newPosition.y];
        tiles[newPosition.x][newPosition.y] = currentTile;
    },
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new Error('Combat information do not exist.');
        }
        let parsedMap = JSON.parse(combat.content.map);

        let name = '';
        let directions = '';
        if (message.author.id != dmID) {
            //get character name
            const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
            if (!playerData) {
                throw new Error(`You do not have a character.`);
            }
            [name] = playerData.characters;

            //get directions
            directions = args[0];
        } else {
            name = args[0];
            directions = args[1];
        }

        if (!Object.keys(parsedMap.specialObjects).includes(name)) {
            return await message.reply(`${name} is not there.`);
        }

        //try to move
        try {
            const newPosition = moveObj(parsedMap.specialObjects[name], parsedMap.tiles, parsedMap.dimensions, directions);

            //swap new position with the current
            const currentPosition = parsedMap.specialObjects[name];
            this.swapPositions(parsedMap.tiles, currentPosition, newPosition);

            //store the information to shortcut obj
            parsedMap.specialObjects[name] = {
                x: newPosition.x,
                y: newPosition.y
            };
        } catch (error) {
            return await message.reply(error.message);
        }

        //update map
        const newMapValue = {
            $set: {
                'content.map': JSON.stringify(parsedMap)
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat' }, newMapValue);
    }
}