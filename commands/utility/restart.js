const auth = require('../../auth.json');

module.exports = {
    name: 'restart',
    args: false,
    description: 'Restart the bot.',
    // async execute(client) {
    //     console.log("Auto restart because of error.")
    //         .then(msg => client.destroy())
    //         .then(() => client.login(auth.token));
    // },
    async execute(client, message) {
        if(message.author.id == auth.dmID) {
            message.channel.send('Bazmeg.')
                .then(msg => client.destroy())
                .then(() => client.login(auth.token));
        }
    }
}