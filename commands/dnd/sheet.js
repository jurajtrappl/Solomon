const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "sheet",
    args: false,
    description: "Shows players character sheet.",
    printSavingThrowProficiencies: function(obj) {
        let proficiencies = "";
        for(let key in obj) {
            if(obj[key]) proficiencies += `${key} `;
        }
        return proficiencies;
    },
    printSkillProficiencies: function(obj) {
        let proficiencies = "";
        for(let skill in obj) {
            if(obj[skill]["prof"]) proficiencies += `${skill} `;
        }
        return proficiencies;
    },
    async execute(message, args, db) {
        if (args[0] == "help") {
            db
                .collection("helpEmbeds")
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
            //get character name
            let resultName = await db
                .collection("players")
                .find({
                    discordID: message.author.id,
                })
                .toArray();
            let characterName = resultName[0]["characters"][0];

            let resultSheet = await db
                .collection("characters")
                .find({
                    characterName: characterName,
                })
                .toArray();
            let sheet = resultSheet[0];

            const embed = new MessageEmbed()
                .setColor("#00ff00")
                .setTitle("Character sheet")
                .addFields(
                    { 
                        name: "Abilities", 
                        value: `Strength: ${sheet["abilities"]["Strength"]}
                                Dexterity: ${sheet["abilities"]["Dexterity"]}
                                Constitution: ${sheet["abilities"]["Constitution"]}
                                Intelligence: ${sheet["abilities"]["Intelligence"]}
                                Wisdom: ${sheet["abilities"]["Wisdom"]}
                                Charisma: ${sheet["abilities"]["Charisma"]}` 
                    },
                    {
                        name: "Class",
                        value: sheet["class"]
                    },
                    {
                        name: "Hit dice",
                        value: `Type: 1d${sheet["hitDice"]["type"]}
                                Count: ${sheet["hitDice"]["count"]}
                                Spent: ${sheet["hitDice"]["spent"]}`
                    },
                    {
                        name: "Level",
                        value: sheet["level"]
                    },
                    {
                        name: "Max HP",
                        value: sheet["maxHP"]
                    },
                    {
                        name: "Proficiency bonus",
                        value: sheet["proficiencyBonus"]
                    },
                    {
                        name: "Race",
                        value: sheet["race"]
                    },
                    {
                        name: "Saving throws proficiencies",
                        value: `${this.printSavingThrowProficiencies(sheet["savingThrows"])}`
                    },
                    {
                        name: "Skills proficiencies",
                        value: `${this.printSkillProficiencies(sheet["skills"])}`
                    },
                    {
                        name: "Speed",
                        value: sheet["speed"]
                    },
                    {
                        name: "XP",
                        value: sheet["xp"]
                    }
                );

            return await message.reply({ embed: embed });
        }
    }
};