const { printHelpEmbed } = require('../output/help');

module.exports = {
    name: 'commands',
    args: false,
    description: 'List of all commands.',
    async execute(message, _args, mongo, _discordClient) {
        return await printHelpEmbed(this.name, message, mongo);
    }
}