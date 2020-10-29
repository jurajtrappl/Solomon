const settings = require("../../settings.json");

module.exports = {
    name: "addxp",
    description: "Modify players XP count - DM only.",
    args: true,
    tableName: "characters",
    async execute(message, args, dbClient) {
        //ensure that add experience command is only for the DM
        if (message.author.id == settings.dmID) {
            await dbClient.connect();
            const dndDb = dbClient.db("dnd");

            if (args.length == 0 || args[0] == "help") {
                dndDb.collection("helpEmbeds").find({
                    commandName: this.name
                }).toArray(async (err, result) => {
                    if (err) throw err;
                    return await message.reply({
                        embed: result[0],
                    });
                });
            } else {
                dbClient.connect((err, db) => {
                    if (err) throw err;

                    const addXP = args[1];
                    const characterName = args[0];
                    const dndDb = db.db("dnd");

                    dndDb
                        .collection("characters")
                        .find({
                            characterName: characterName,
                        })
                        .toArray((err, result) => {
                            if (err) throw err;

                            const characterSheet = result[0];

                            const isNextLevelExp = (exp) =>
                                exp > characterSheet["xp"] + Number(args[1]);

                            const newLvl = Object.values(characterAdv["xp"]).findIndex(
                                isNextLevelExp
                            );

                            const newValues = {
                                $set: {
                                    level: newLvl,
                                    xp: characterSheet["xp"] + Number(addXP),
                                },
                            };

                            dndDb.collection("characters").updateOne({
                                    characterName: characterName,
                                },
                                newValues,
                                (err) => {
                                    if (err) throw err;
                                }
                            );
                        });
                    db.Close();
                });
            }
        } else {
            return await message.reply("ty beťar jeden :smile:.");
        }
    },
};