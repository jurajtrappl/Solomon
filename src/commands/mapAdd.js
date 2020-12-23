const { database } = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../output/help');
const { Tile, TileTypeArgs, TileType } = require('../combat/map');

module.exports = {
    name: 'mapAdd',
    args: false,
    description: 'Adds an object to the map.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        const tileTypeArg = args[0];
        if (!Object.keys(TileTypeArgs).includes(tileTypeArg)) {
            return await message.reply('Tile type does not exist.');
        }

        //get map
        const combat = await mongo.tryFind(database.collections.data, { name: 'Combat' });
        if (!combat) {
            throw new Error('Combat information do not exist.');
        }
        let parsedMap = JSON.parse(combat.content.map);

        //check for the duplicity of objects
        const name = args[1];
        if (Object.keys(parsedMap.specialObjects).includes(name)) {
            return await message.reply(`${name} is already there.`);
        }

        const row = Number(args[2]);
        const col = Number(args[3]);
        const mapWidth = parsedMap.dimensions.width;
        const mapHeight = parsedMap.dimensions.height;

        //check if row and col are present
        if (row > mapHeight || row <= 0 || col > mapWidth || col <= 0) {
            return await message.reply('Indices out of bounds.');
        }

        //check if there is already something or not
        if (!parsedMap.tiles[row][col].type == TileType.free) {
            return await message.reply('There is already an object.');
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