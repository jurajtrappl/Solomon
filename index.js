const auth = require('./auth.json');
const fs = require('fs');
const Discord = require('discord.js');
const { MongoClient } = require('mongodb');
const settings = require('./settings.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

//load commands
for(let dir of settings.commandDirs) {
    let commandFiles = fs.readdirSync(dir).filter(file => file.endsWith('.js'));
    commandFiles.forEach(file => {
        const command = require(`${dir}/${file}`);
        client.commands.set(command.name, command);
    });
}

//connect to the database
const dbClient = new MongoClient(auth.connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

client.once('ready', () => {
    console.log('Ready!');
});

client.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection: ', error);
})

client.on('message', async message => {
    if (message.author.bot) return;

    //command
    if (message.content.startsWith(settings.commandPrefix)) {
        const args = message.content.slice(settings.commandPrefix.length).split(/ +/);
        const commandName = args.shift();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        if (command.guildOnly && message.channel.type !== 'text') {
            return message.reply('There was an error trying to execute that command!');
        }
       
        try {
            command.execute(message, args, dbClient);
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command!');
        }
    }
});

client.login(auth.token);