const auth = require("../../auth.json");
const settings = require('../../settings.json');
const { helpEmbed } = require('../embed.js');
const { moveObj } = require('../movement.js');

module.exports = {
    name: 'move',
    args: false,
    description: 'Move an object on the map.',
    swapPositions: function (tiles, currentPosition, newPosition) {
        let currentTile = tiles[currentPosition.x][currentPosition.y];
        tiles[currentPosition.x][currentPosition.y] = tiles[newPosition.x][newPosition.y];
        tiles[newPosition.x][newPosition.y] = currentTile;
    },
    async execute(message, args, db, _client) {
        const resultMap = await db
            .collection(settings.database.collections.data)
            .find({
                name: 'Combat',
            })
            .toArray();
        const map = resultMap[0]['content']['map'];
        let parsedMap = JSON.parse(map);

        let name = '';
        let directions = '';
        if (message.author.id != auth.dmID) {
            //get character name
            const resultName = await db
                .collection(settings.database.collections.players)
                .find({
                    discordID: message.author.id,
                })
                .toArray();
            name = resultName[0]["characters"][0];

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
    }
}