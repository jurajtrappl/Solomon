const auth = require('./auth.json');
const {
    Client
} = require('discord.js');
const {
    CommandValidator,
    CommandDirector
} = require('./command');
const {
    MongoClient
} = require('mongodb');

const client = new Client();
const dbClient = new MongoClient(auth.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let director = {};

client.once('ready', async () => {
    console.log('Ready!');
    await dbClient.connect();
    director = new CommandDirector(client, dbClient);
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

client.on('playerKnocked', async characterName => {
    //not implemented
});

client.on('playerDead', async characterName => {
    //not implemented
});

client.on('message', async message => {
    if (CommandValidator.validate(message)) {
        const prefix = message.content.substring(0, 1);
        const args = message.content.slice(prefix.length).split(/ +/);
        const commandName = args.shift();

        await director.execute(commandName, args, message);
    }
});

client.login(auth.token);