const { command } = require('./settings.json');
const { SourceFileLoader } = require('./loader');

/**
 * CommandValidator.
 * 
 * @class CommandValidator
 */
class CommandValidator {
    static validate(message) {
        return (!message.author.bot) && message.content.startsWith(command.prefix);
    }
}

/**
 * CommandsDirector.
 * 
 * @class CommandsDirector.
 */
class CommandsDirector {
    constructor(discordClient, mongo) {
        this.discordClient = discordClient;
        this.mongo = mongo;
        this.commands = SourceFileLoader.load(command.directories);
    }

    findCommand(commandName) {
        return this.commands.get(commandName) ||
            this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    }

    async execute(name, args, message) {
        const command = this.findCommand(name);

        if (!command) return;

        if (command.guildOnly && message.channel.type !== 'text') {
            return await message.reply(settings.errorCommandExecuteMessage);
        }

        try {
            await command.execute(message, args, this.mongo, this.discordClient);
        } catch (error) {
            console.log(error);
            await message.reply(error.message);
        }
    }
}

module.exports = {
    CommandsDirector,
    CommandValidator
}