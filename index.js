const auth = require('./auth.json');
const fs = require('fs');
const {
    Client,
    Collection
} = require('discord.js');
const {
    MongoClient
} = require('mongodb');
const settings = require('./settings.json');

const client = new Client();
client.commands = new Collection();

//load commands
for (let dir of settings.commandDirs) {
    let commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
    commandFiles.forEach(file => {
        const command = require(`${dir}/${file}`);
        client.commands.set(command.name, command);
    });
}

//set up mongo db client
const dbClient = new MongoClient(auth.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//set up empty object where will be the D&D database assigned after connecting to the client
let dndDb = {};

client.once('ready', async () => {
    console.log('Ready!');

    await dbClient.connect();
    dndDb = dbClient.db("dnd");
});

client.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection: ', error);
})

client.on("error", (e) => {
    //report an error that has happened
    console.error(e)

    //restart the bot automatically
    const restartCommandName = "restart";

    const restartCommand = client.commands.get(restartCommandName) ||
        client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(restartCommandName));

    if (!restartCommand) return;

    try {
        restartCommand.execute(client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// client.on("warn", (e) => console.warn(e));

// client.on("debug", (e) => console.info(e));

client.on('message', async message => {
    if (message.author.bot) return;

    if (message.content.startsWith(settings.commandPrefix)) {
        const args = message.content.slice(settings.commandPrefix.length).split(/ +/);
        const commandName = args.shift();

        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.guildOnly && message.channel.type !== 'text') {
            return message.reply('There was an error trying to execute that command!');
        }

        try {
            command.execute(message, args, dndDb);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    } else if (message.content.startsWith(settings.utilityCommandPrefix)) {
        const args = message.content.slice(settings.commandPrefix.length).split(/ +/);
        const commandName = args.shift();

        const command = client.commands.get(commandName) ||
            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        try {
            command.execute(client, message);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
});

client.login(auth.token);