const { database } = require('../settings.json');
const { makeHelpEmbed } = require('../src/embed');

const HELP_ARG = 'help';

const askedForHelp = args => args.length >= 1 && args[0] == HELP_ARG;

const printHelpEmbed = async (commandName, message, mongo) => {
    const helpEmbed = await mongo.tryFind(database.collections.helpEmbeds, { commandName: commandName });
    if (!helpEmbed) {
        throw new Error(`${commandName} has not a help embed.`);
    }

    return await message.reply({
        embed: makeHelpEmbed(message.member.displayHexColor, helpEmbed),
    });
}

module.exports = {
    askedForHelp,
    printHelpEmbed
}