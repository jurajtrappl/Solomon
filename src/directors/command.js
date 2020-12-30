const { dmID } = require('../../auth.json');
const { commands } = require('../../settings.json');
const { SourceFileLoader } = require('../../loader');

/**
 * CommandValidator.
 * 
 * @class CommandValidator
 */
class CommandValidator {
    static isCommand = (prefix, message) => {
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
}

module.exports = {
    CommandsDirector,
    CommandValidator
}