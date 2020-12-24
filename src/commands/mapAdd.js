const { ArgsValidator, type } = require('../err/argsValidator');
const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');
const { Tile, TileTypeArgs, TileType } = require('../combat/map');
const { OutOfRangeError, DuplicateObjectError, MapTileOccupiedError } = require('../err/errors');

module.exports = {
    name: 'mapAdd',
    args: false,
    description: 'Adds an object to the map.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        ArgsValidator.CheckCount(args, 4);
        let row = args[3];
        ArgsValidator.TypeCheckOne(row, type.numeric);
        let col = args[4];
        ArgsValidator.TypeCheckOne(col, type.numeric);

        const tileTypeArg = args[0];
        if (!Object.keys(TileTypeArgs).includes(tileTypeArg)) {
            throw new NotExistingError(tileTypeArg);
        }

        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new NotFoundError(searchingObjType.dataFile, 'Combat');
        }
        let parsedMap = JSON.parse(combat.content.map);

        //check for the duplicity of objects
        const name = args[1];
        if (Object.keys(parsedMap.specialObjects).includes(name)) {
            throw new DuplicateObjectError(name);
        }

        row = Number(args[2]);
        col = Number(args[3]);
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
        const nameInitial = name[0];
        const newTile = new Tile(TileTypeArgs[tileTypeArg], nameInitial);
        parsedMap.tiles[row][col] = newTile;

        //add a shortcut for the new object with the name as a key
        parsedMap.specialObjects[name] = { x: row, y: col };

        //update map
        const newMapValue = {
            $set: {
                'map': JSON.stringify(parsedMap)
            }
        };

        await mongo.updateOne(database.collections.data, { name: 'Combat.content' }, newMapValue);

        //update list of combatants
        const newCombatant = {
            name: name,
            type: TileTypeArgs[tileTypeArg]
        };

        if (TileTypeArgs[tileTypeArg] != TileType.border && TileTypeArgs[tileTypeArg] != TileType.free) {
            await mongo.updateOne(database.collections.data, { name: 'Combat' }, newCombatant);
        }
    }
}