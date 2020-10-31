const fs = require('fs');
const {
    Collection
} = require('discord.js');
const settings = require('./settings.json');

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
            let commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
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
        return (!message.author.bot) &&
            settings.prefixes.some(p => message.content.startsWith(p));
    }
}

/**
 * CommandDirector.
 * 
 * @class CommandDirector.
 */
class CommandDirector {
    constructor(client, database) {
        this.client = client;
        this.database = database;

        this.dndCommands = CommandLoader.load(settings.dndCommandDirs);
        this.utilityCommands = CommandLoader.load(settings.utilityCommandDirs);

        this.commandLists = {
            "/": this.dndCommands,
            "!": this.utilityCommands
        }
    }

    findCommand(prefix, commandName) {
        return this.commandLists[prefix].get(commandName) || 
            this.commandLists[prefix].find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    }

    async execute(prefix, commandName, args, message) {
        const command = this.findCommand(prefix, commandName);
        
        if (!command) return;

        if (command.guildOnly && message.channel.type !== 'text') {
            return await message.reply(settings.errorCommandExecuteMessage);
        }
        
        try {
            await command.execute(message, args, this.database.dndDb());
        } catch (error) {
            console.error(error);
            message.reply(settings.errorCommandExecuteMessage);
        }
    }
}

module.exports = {
    CommandDirector,
    CommandValidator
}