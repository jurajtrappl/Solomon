const settings = require('../../../settings.json');
const combat = require('../../map.js');

module.exports = {
    name: 'mapAdd',
    args: false,
    description: 'Adds an object to the map.',
    async execute(message, args, db, _client) {
        //check if map object type exists
        const mapObjectTypeArg = args[0];
        if (!Object.keys(combat.MapObjectType).includes(mapObjectTypeArg)) {
            return await message.reply('Not existing type of map object.');
        }

        const name = args[1];

        //get map
        let resultMap = await db
            .collection(settings.database.collections.data)
            .find({
                name: 'Combat',
            })
            .toArray();
        let map = resultMap[0]['content']['map'];

        const row = Number(args[2]);
        const col = Number(args[3]);
        const mapWidth = map['dimensions']['width'];
        const mapHeight = map['dimensions']['height'];

        //check if row and col are present
        if (row > mapHeight || row <= 0 || col > mapWidth || col <= 0) {
            return await message.reply('Indices out of bounds.');
        }

        const newMapObject = new combat.MapObject(name, combat.MapObjectType[mapObjectTypeArg], row, col);

        //update tiles with the new flag
        map['tiles'][row][col] = newMapObject.flag;
        db.collection(settings.database.collections.data).updateOne({
            name: 'Combat'
        }, {
            $set: {
                "content.map.tiles": map['tiles']
            }
        }, (err) => {
            if (err) throw err;
        });

        //update objects
        db.collection(settings.database.collections.data).updateOne({
            name: 'Combat'
        }, {
            $push: {
                "content.map.objects": JSON.stringify(newMapObject)
            }
        }, (err) => {
            if (err) throw err;
        });
    }
}