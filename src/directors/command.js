const { dmID } = require('../../auth.json');
const { commands } = require('../../settings.json');
const { SourceFileLoader } = require('../../loader');

/**
 * CommandValidator.
 * 
 * @class CommandValidator
 */
class CommandValidator {
    static validate = (prefix, message) => {
        if (!Object.values(commands.prefixes).includes(prefix)) {
            return false;
        }
        
        if (message.author.bot) {
            return false;
        }

        if (prefix === commands.prefixes.dm) {
            return message.author.id === dmID;
        }

        return true;
    }
}

/**
 * CommandsDirector.
 * 
 * @class CommandsDirector.
 */
class CommandsDirector {
    constructor(discordClient, mongo, directories) {
        this.discordClient = discordClient;
        this.mongo = mongo;
        
        this.commands = SourceFileLoader.load(directories);
    }

    findCommand = (commandName) => 
        this.commands.get(commandName) ||
            this.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    execute = async (name, args, message) => {
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