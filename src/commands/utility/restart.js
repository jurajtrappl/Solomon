const auth = require('../../../auth.json');

module.exports = {
    name: 'restart',
    args: false,
    description: 'Restart the bot.',
    async execute(message, _args, _db, client) {
        if (message.author.id == auth.dmID) {
            message.channel.send('Bazmeg restart.').then(m => {
                client.destroy()
            }).then(() => {
                client.login(auth.token);
            });
        }
    }
}