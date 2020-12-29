const { ArgsValidator } = require('../../../err/argsValidator');
const { database } = require('../../../../settings.json');
const { makeHelpEmbed } = require('../../../output/embed');
const { NotExistingError } = require('../../../err/errors');

module.exports = {
    name: 'help',
    args: true,
    description: 'Prints an help about the command.',
    async execute(message, args, mongo, _discordClient) {
        ArgsValidator.checkCount(args, 1);

        const commandName = args[0];
        const helpEmbed = await mongo.tryFind(database.collections.helpEmbeds, { commandName: commandName });
        if (!helpEmbed) {
            throw new NotExistingError(`${commandName} help embed`);
        }

        return await message.reply({
            embed: makeHelpEmbed(message.member.displayHexColor, helpEmbed),
        });
    }
}