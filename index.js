const { Client } = require('discord.js');
const { CommandDirector, CommandValidator } = require('./command');
const { MongoServices } = require('./src/db/mongoServices');
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
    console.error('Unhandled promise rejection: ', message);
})

discordClient.on("error", ({ message }) => {
    console.error(message);
});

discordClient.on('playerKnocked', () => { /* not implemented */ });

discordClient.on('playerDead', () => { /* not implemented */ });

discordClient.on('message', async message => {
    if (CommandValidator.validate(message)) {
        const prefix = message.content.substring(0, 1);
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift();

        await commandDirector.execute(commandName, args, message);
    }
});

discordClient.login(token);