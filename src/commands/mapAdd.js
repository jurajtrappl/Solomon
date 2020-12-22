const settings = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../help');
const { Tile, TileTypeArgs, TileType } = require('../map.js');

module.exports = {
    name: 'mapAdd',
    args: false,
    description: 'Adds an object to the map.',
    async execute(message, args, db, _client) {
        if (askedForHelp(args)) {
            printHelpEmbed(this.name, message, db);
            return;
        }

        const tileTypeArg = args[0];
        if (!Object.keys(TileTypeArgs).includes(tileTypeArg)) {
            return await message.reply('Tile type does not exist.');
        }

        //get map
        let resultMap = await db
            .collection(settings.database.collections.data)
            .find({
                name: 'Combat',
            })
            .toArray();
        let map = resultMap[0]['content']['map'];
        let parsedMap = JSON.parse(map);

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
        await db.collection(settings.database.collections.data).updateOne({
            name: 'Combat'
        }, {
            $set: {
                'content.map': JSON.stringify(parsedMap)
            }
        },
            (err) => {
                if (err) throw err;
            }
        );

        //update list of combatants
        const newCombatant = {
            name: name,
            type: TileTypeArgs[tileTypeArg]
        };

        if (TileTypeArgs[tileTypeArg] != TileType.border && TileTypeArgs[tileTypeArg] != TileType.free) {
            await db.collection(settings.database.collections.data).updateOne({
                name: 'Combat'
            }, {
                $push: {
                    'content.combatants': JSON.stringify(newCombatant)
                }
            },
                (err) => {
                    if (err) throw err;
                }
            );
        }
    }
}