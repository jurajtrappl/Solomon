const { database } = require('../../../../settings.json');
const { moveObj } = require('../../../combat/movement');
const { NotFoundError, searchingObjType, NotExistingError } = require('../../../err/errors');

module.exports = {
    name: 'move',
    description: 'Move an object on the map.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'directions' }]
        ]
    },
    swapPositions: (tiles, currentPosition, newPosition) => {
        let currentTile = tiles[currentPosition.x][currentPosition.y];
        tiles[currentPosition.x][currentPosition.y] = tiles[newPosition.x][newPosition.y];
        tiles[newPosition.x][newPosition.y] = currentTile;
    },
    async execute(message, [ directions ], mongo, _discordClient) {
        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new NotFoundError(searchingObjType.dataFile, 'Combat');
        }
        let parsedMap = JSON.parse(combat.content.map);

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        if (!Object.keys(parsedMap.specialObjects).includes(characterName)) {
            throw new NotExistingError(characterName);
        }

        //try to move
        const newPosition = moveObj(parsedMap.specialObjects[characterName], parsedMap.tiles, parsedMap.dimensions, directions);

        //swap new position with the current
        const currentPosition = parsedMap.specialObjects[characterName];
        this.swapPositions(parsedMap.tiles, currentPosition, newPosition);

        //store the information to shortcut obj
        parsedMap.specialObjects[characterName] = {
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