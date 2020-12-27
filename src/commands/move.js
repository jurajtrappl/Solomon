const { ArgsValidator } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { dmID } = require('../../auth.json');
const { moveObj } = require('../combat/movement');
const { NotFoundError, searchingObjType, NotExistingError } = require('../err/errors');

module.exports = {
    name: 'move',
    args: false,
    description: 'Move an object on the map.',
    swapPositions: (tiles, currentPosition, newPosition) => {
        let currentTile = tiles[currentPosition.x][currentPosition.y];
        tiles[currentPosition.x][currentPosition.y] = tiles[newPosition.x][newPosition.y];
        tiles[newPosition.x][newPosition.y] = currentTile;
    },
    async execute(message, args, mongo, _discordClient) {
        ArgsValidator.checkCount(args, 1);

        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new NotFoundError(searchingObjType.dataFile, 'Combat');
        }
        let parsedMap = JSON.parse(combat.content.map);

        let name = '';
        let directions = '';
        if (message.author.id != dmID) {
            //get character name
            const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
            if (!playerData) {
                throw new NotFoundError(searchingObjType.player, message.author.id);
            }
            name = playerData.character;

            //get directions
            directions = args[0];
        } else {
            name = args[0];
            directions = args[1];
        }

        if (!Object.keys(parsedMap.specialObjects).includes(name)) {
            throw new NotExistingError(name);
        }

        //try to move
        const newPosition = moveObj(parsedMap.specialObjects[name], parsedMap.tiles, parsedMap.dimensions, directions);

        //swap new position with the current
        const currentPosition = parsedMap.specialObjects[name];
        this.swapPositions(parsedMap.tiles, currentPosition, newPosition);

        //store the information to shortcut obj
        parsedMap.specialObjects[name] = {
            x: newPosition.x,
            y: newPosition.y
        };

        //update map
        const newMapValue = {
            $set: {
                'content.map': JSON.stringify(parsedMap)
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat' }, newMapValue);
    }
}