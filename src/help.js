const settings = require('../settings.json');
const { helpEmbed } = require('../src/embed');

const HELP_ARG = 'help';

const askedForHelp = args => args.length >= 1 && args[0] == HELP_ARG;

const printHelpEmbed = async (commandName, message, db) => {
    let resultEmbed = await db.collection(settings.database.collections.helpEmbeds)
        .find({
            commandName: commandName,
        })
        .toArray();
    let embed = resultEmbed[0];
    return await message.reply({
        embed: helpEmbed(message.member.displayHexColor, embed),
    });
}

module.exports = {
    askedForHelp,
    printHelpEmbed
}