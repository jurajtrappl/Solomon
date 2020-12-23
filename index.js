const { Client } = require('discord.js');
const { CommandDirector, CommandValidator } = require('./command');
const { MongoServices } = require('./src/database/services');
const { token } = require('./auth.json');

const discordClient = new Client();
let commandDirector = {};
const mongo = new MongoServices();

discordClient.once('ready', async () => {
    console.log('Ready!');

    await mongo.connect();

    commandDirector = new CommandDirector(discordClient, mongo);
});

discordClient.on('unhandledRejection', ({ message }) => {
    console.error(`Unhandled promise rejection: ${message}`);
})

discordClient.on("error", ({ message }) => {
    console.error(`Error: ${message}`);
});

discordClient.on('playerKnocked', () => { /* not implemented */ });

discordClient.on('playerDead', () => { /* not implemented */ });

discordClient.on('message', async message => {
    if (CommandValidator.validate(message)) {
        const commandPrefix = message.content.substring(0, 1);
        const commandArgs = message.content.slice(commandPrefix.length).split(/ +/);
        const commandName = commandArgs.shift();

        await commandDirector.execute(commandName, commandArgs, message);
    }
});

discordClient.login(token);