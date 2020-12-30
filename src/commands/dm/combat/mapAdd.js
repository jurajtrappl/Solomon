const { database } = require('../../../../settings.json');
const { Tile, TileTypeArgs, TileType } = require('../../../combat/map');
const { OutOfRangeError, DuplicateObjectError, MapTileOccupiedError } = require('../../../err/errors');

module.exports = {
    name: 'mapAdd',
    description: 'Adds an object on the map.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'mapObject' }, { type: 'tileType' }, { type: 'number' }, { type: 'number' }]
        ]
    },
    async execute(_message, [ tileType, mapObjectName, row, col ], mongo, _discordClient) {
        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new NotFoundError(searchingObjType.dataFile, 'Combat');
        }
        let parsedMap = JSON.parse(combat.content.map);

        //check for the duplicity of objects
        if (Object.keys(parsedMap.specialObjects).includes(mapObjectName)) {
            throw new DuplicateObjectError(mapObjectName);
        }

        row = Number(row);
        col = Number(col);
        const mapWidth = parsedMap.dimensions.width;
        const mapHeight = parsedMap.dimensions.height;

        //check if row and col are present
        if (row > mapHeight || row <= 0) {
            throw new OutOfRangeError('Row index', 1, mapHeight);
        }

        if (col > mapWidth || col <= 0) {
            throw new OutOfRangeError('Col index', 1, mapWidth);
        }

        //check if there is already something or not
        if (!parsedMap.tiles[row][col].type == TileType.free) {
            throw new MapTileOccupiedError();
        }

        //create a new tile
        const nameInitial = mapObjectName[0];
        const newTile = new Tile(TileTypeArgs[tileType], nameInitial);
        parsedMap.tiles[row][col] = newTile;

        //add a shortcut for the new object with the name as a key
        parsedMap.specialObjects[mapObjectName] = { x: row, y: col };

        //update map
        const newMapValue = {
            $set: {
                'content.map': JSON.stringify(parsedMap)
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat' }, newMapValue);

        //update list of combatants
        const newCombatant = {
            name: mapObjectName,
            type: TileTypeArgs[tileType]
        };

        const newCombatantValue = {
            $push: {
                'content.combatants': newCombatant
            }
        }

        if (TileTypeArgs[tileType] != TileType.border && TileTypeArgs[tileType] != TileType.free) {
            await mongo.updateOne(database.collections.data, { name: 'Combat' }, newCombatantValue);
        }
    }
}