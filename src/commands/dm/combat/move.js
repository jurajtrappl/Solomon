const { database } = require('../../../../settings.json');
const { moveObj } = require('../../../combat/movement');
const { NotFoundError, searchingObjType, NotExistingError } = require('../../../err/errors');

module.exports = {
    name: 'move',
    description: 'Move an object on the map.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'mapObject' }, { type: 'directions' }]
        ]
    },
    swapPositions: (tiles, currentPosition, newPosition) => {
        let currentTile = tiles[currentPosition.x][currentPosition.y];
        tiles[currentPosition.x][currentPosition.y] = tiles[newPosition.x][newPosition.y];
        tiles[newPosition.x][newPosition.y] = currentTile;
    },
    async execute(_message, [ mapObjectName, directions ], mongo, _discordClient) {
        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new NotFoundError(searchingObjType.dataFile, 'Combat');
        }
        let parsedMap = JSON.parse(combat.content.map);

        //try to move
        const newPosition = moveObj(parsedMap.specialObjects[mapObjectName], parsedMap.tiles, parsedMap.dimensions, directions);

        //swap new position with the current
        const currentPosition = parsedMap.specialObjects[mapObjectName];
        this.swapPositions(parsedMap.tiles, currentPosition, newPosition);

        //store the information to shortcut obj
        parsedMap.specialObjects[mapObjectName] = {
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