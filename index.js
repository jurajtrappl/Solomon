const { Client } = require('discord.js');
const { CommandsDirector, CommandValidator } = require('./src/directors/command');
const { GameEventsDirector, SessionLogEventsDirector } = require('./src/directors/event');
const { MongoServices } = require('./src/mongo/services');
const { token } = require('./auth.json');

const discordClient = new Client();
const mongo = new MongoServices();

let commandsDirector = {};
let gameEventsDirector = {};
let sessionLogEventsDirector = {};

discordClient.once('ready', async () => {
    await mongo.connect();

    commandsDirector = new CommandsDirector(discordClient, mongo);
    gameEventsDirector = new GameEventsDirector(discordClient, mongo);
    sessionLogEventsDirector = new SessionLogEventsDirector(discordClient);

    console.log('Ready!');
});

discordClient.on('unhandledRejection', ({ message }) => {
    console.error(`Unhandled promise rejection: ${message}`);
})

discordClient.on('error', ({ message }) => {
    console.error(`Error: ${message}`);
});

discordClient.on('gameEvent', async (eventName, eventArgs) => {
    await gameEventsDirector.execute(eventName, eventArgs);
});

discordClient.on('sessionLog', async (eventName, eventArgs) => {
    await sessionLogEventsDirector.execute(eventName, eventArgs);
})

discordClient.on('message', async message => {
    if (CommandValidator.validate(message)) {
        const commandPrefix = message.content.substring(0, 1);
        const commandArgs = message.content.slice(commandPrefix.length).split(/ +/);
        const commandName = commandArgs.shift();

        await commandsDirector.execute(commandName, commandArgs, message);
    }
});

discordClient.login(token);