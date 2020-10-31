const auth = require('./auth.json');
const {
    Client
} = require('discord.js');
const {
    CommandValidator,
    CommandDirector
} = require('./command');
const {
    Database
} = require('./database');

const client = new Client();
const database = new Database(auth.connectionString);
const director = new CommandDirector(client, database);

client.once('ready', async () => {
    console.log('Ready!');
});

client.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection: ', error);
})

client.on("error", (e) => {
    //report an error that has happened
    console.error(e)

    //restart the bot automatically
    director.execute("!", "restart", [], {});
});

// client.on("warn", (e) => console.warn(e));

// client.on("debug", (e) => console.info(e));

client.on('message', async message => {
    if (CommandValidator.validate(message)) {
        const prefix = message.content.substring(0, 1);
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift();

        await director.execute(prefix, commandName, args, message);
    }
});

client.login(auth.token);