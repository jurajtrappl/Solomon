const { event, channels } = require('./settings.json');
const { SourceFileLoader } = require('./loader');

/**
 * GameEventsDirector.
 * 
 * @class GameEventsDirector.
 */
class GameEventsDirector {
    constructor(discordClient, mongo) {
        //text channels
        this.errorsTextChannel = discordClient.channels.cache.find(channel => channel.name === channels.errors);
        this.messageChannel = discordClient.channels.cache.find(channel => channel.name === channels.sessions);
        
        //db service
        this.mongo = mongo;

        //source files
        this.events = SourceFileLoader.load(event.game.directories);
    }

    findEvent(name) {
        return this.events.get(name) ||
            this.events.find(event => event.aliases && event.aliases.includes(name));
    }

    async execute(name, args) {
        const event = this.findEvent(name);

        if (!event) return;

        try {
            await event.execute(this.messageChannel, args, this.mongo);
        } catch (error) {
            console.log(error);
            await this.errorsTextChannel.send(error.message);
        }
    }
}

/**
 * SessionLogEventsDirector.
 * 
 * @class SessionLogEventsDirector.
 */
class SessionLogEventsDirector {
    constructor(discordClient) {
        //text channels
        this.errorsTextChannel = discordClient.channels.cache.find(channel => channel.name === channels.errors);
        this.messageChannel = discordClient.channels.cache.find(channel => channel.name === channels.sessionsStory);
        
        //source files
        this.events = SourceFileLoader.load(event.logs.directories);
    }

    findEvent(name) {
        return this.events.get(name) ||
            this.events.find(event => event.aliases && event.aliases.includes(name));
    }

    async execute(name, args) {
        const event = this.findEvent(name);

        if (!event) return;

        try {
            await event.execute(this.messageChannel, args);
        } catch (error) {
            console.log(error);
            await this.errorsTextChannel.send(error.message);
        }
    }
}

module.exports = {
    GameEventsDirector,
    SessionLogEventsDirector
}