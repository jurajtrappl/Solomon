const settings = require('../settings.json');

const color = async (messageAuthorId, db) => {
    //get character name
    const resultColor = await db
        .collection(settings.database.collections.players)
        .find({
            discordID: messageAuthorId,
        })
        .toArray();
    return resultColor[0].color;
}

module.exports = {
    color
}