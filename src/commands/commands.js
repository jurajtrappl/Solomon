const { printHelpEmbed } = require('../help');

module.exports = {
    name: 'commands',
    args: false,
    description: 'List of all commands.',
    async execute(message, _args, db) {
        printHelpEmbed(this.name, message, db);
    }
}