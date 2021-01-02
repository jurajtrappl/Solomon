const { ArgsValidator } = require('./src/err/argsValidator');
const { Client } = require('discord.js');
const { commands } = require('./settings.json');
const { CommandsDirector, CommandValidator } = require('./src/directors/command');
const { GameEventsDirector, SessionLogEventsDirector } = require('./src/directors/event');
const { MongoServices } = require('./src/mongo/services');
const { token } = require('./auth.json');

const discordClient = new Client();
const mongo = new MongoServices();

let gameEventsDirector = {};
let sessionLogEventsDirector = {};
const commandDirectors = {};

discordClient.once('ready', async () => {
    await mongo.connect();

    //init command directors
    for (const group in commands.prefixes) {
        const prefix = commands.prefixes[group];
        commandDirectors[prefix] = new CommandsDirector(discordClient, mongo, commands.directories[group]);
    }

    //init event directors
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
    //select a possible command prefix
    const [commandPrefix] = message.content;

    //check if the message is a valid looking command
    if (CommandValidator.isCommand(commandPrefix, message)) {

        //extract important information
        const commandArgs = message.content.slice(commandPrefix.length).split(/ +/);
        const commandName = commandArgs.shift();

        //find a command
        const command = commandDirectors[commandPrefix].findCommand(commandName);

        if (!command) return;

        try {
            if (ArgsValidator.preCheck(command.args.specifics, commandArgs, mongo)) {
                await command.execute(message, commandArgs, mongo, discordClient);
            }
        } catch(error) {
            await message.channel.send(error.message);
        }
    }
});

discordClient.login(token);