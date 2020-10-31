const auth = require("../../auth.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "time",
  args: true,
  description: "Set current date, time and location.",
  async execute(message, args, db) {
    if (message.author.id == auth.dmID) {
      if (args.length == 0 || args[0] == "help") {
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
        //DM command
        let resultTime = await db
          .collection("time")
          .find({
            characterName: args[0],
          })
          .toArray();

        let currentDateTime = new Date(resultTime[0]["datetime"]);

        if (args[1] == "m") {
          currentDateTime.setMinutes(
            currentDateTime.getMinutes() + Number(args[2])
          );
        } else if (args[1] == "h") {
          currentDateTime.setHours(
            currentDateTime.getHours() + Number(args[2])
          );
        }

        const newDateTimeValue = {
          $set: {
            datetime: currentDateTime,
          },
        };

        db.collection("time").updateOne(
          {
            characterName: args[0],
          },
          newDateTimeValue,
          (err) => {
            if (err) throw err;
          }
        );
      }
    } else {
      //Players command
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

        let resultTime = await db
          .collection("time")
          .find({
            characterName: characterName,
          })
          .toArray();
        let time = resultTime[0];

        const embed = new MessageEmbed()
          .setColor("#ff00ff")
          .setTitle("Date, time and location")
          .addFields(
            {
              name: "Date & time:",
              value: time["datetime"].toLocaleString(),
            },
            {
              name: "Location",
              value: time["location"],
            }
          );

        return await message.reply({
          embed: embed,
        });
      }
    }
  },
};
