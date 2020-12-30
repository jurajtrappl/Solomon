const { database } = require('../../../../settings.json');
const { makeHelpEmbed } = require('../../../output/embed');
const { NotExistingError } = require('../../../err/errors');

module.exports = {
    name: 'help',
    description: 'Prints an help about the command.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'string' }]
        ]
    },
    async execute(message, [ commandName ], mongo, _discordClient) {
        const helpEmbed = await mongo.tryFind(database.collections.helpEmbeds, { commandName: commandName });
        if (!helpEmbed) {
            throw new NotExistingError(`${commandName} help embed`);
        }

        return await message.reply({
            embed: makeHelpEmbed(message.member.displayHexColor, helpEmbed),
        });
    }
}