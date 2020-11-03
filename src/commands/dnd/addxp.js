const auth = require("../../../auth.json");
const settings = require('../../../settings.json');

module.exports = {
    name: "addxp",
    description: "Modify players XP count - DM only.",
    args: true,
    async execute(message, args, db, _client) {
        if (message.author.id == auth.dmID) {
            if (args.length == 0 || args[0] == "help") {
                db.collection(settings.database.collections.helpEmbeds)
                    .find({
                        commandName: this.name,
                    })
                    .toArray(async (err, result) => {
                        if (err) throw err;
                        return await message.reply({
                            embed: result[0],
                        });
                    });
            } else {
                const addXP = args[1];

                let resultSheet = await db
                    .collection(settings.database.collections.characters)
                    .find({
                        characterName: args[0],
                    })
                    .toArray();
                let sheet = resultSheet[0];

                let resultCharacterAdvancement = await db
                    .collection(settings.database.collections.data)
                    .find({
                        name: "CharacterAdvancement"
                    })
                    .toArray();
                let characterAdv = resultCharacterAdvancement[0];

                const isNextLevelExp = (exp) =>
                    exp > sheet["xp"] + Number(args[1]);

                const newLvl = Object.values(characterAdv["content"]["xp"]).findIndex(
                    isNextLevelExp
                );

                const newValues = {
                    $set: {
                        level: newLvl,
                        xp: sheet["xp"] + Number(addXP),
                    },
                };

                await db.collection(settings.database.collections.characters).updateOne({
                        characterName: args[0],
                    },
                    newValues,
                    (err) => {
                        if (err) throw err;
                    }
                );
            }
        } else {
            return await message.reply("ty beťar jeden :smile:.");
        }
    },
};