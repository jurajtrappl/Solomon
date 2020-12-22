const settings = require('./settings.json');
const { readdirSync } = require('fs');
const { Collection } = require('discord.js');

/**
 * Static class that loads comments from specified directories
 * to a discord collection
 * 
 * @class CommandLoader
 */
class CommandLoader {
    constructor() {
        if (this instanceof CommandLoader) {
            throw Error('A static class can not be instantiated.');
        }
    }

    static load(directories) {
        const commandCollection = new Collection();
        for (let dir of directories) {
            let commandFiles = readdirSync(dir).filter(file => file.endsWith('.js'));
            commandFiles.forEach(file => {
                const command = require(`${dir}/${file}`);
                commandCollection.set(command.name, command);
            })
        }
        return commandCollection;
    }
}

/**
 * CommandValidator.
 * 
 * @class CommandValidator
 */
class CommandValidator {
    static validate(message) {
        return (!message.author.bot) && message.content.startsWith(settings.prefix);
    }
}

/**
 * CommandDirector.
 * 
 * @class CommandDirector.
 */
class CommandDirector {
    constructor(discordClient, mongo) {
        this.discordClient = discordClient;
        this.mongo = mongo;
        this.commands = CommandLoader.load(settings.commandDirectory);
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
            console.error(error.message);
            await message.reply(settings.errorCommandExecuteMessage);
        }
    }
}

module.exports = {
    CommandDirector,
    CommandValidator
}