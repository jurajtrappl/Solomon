const { bold } = require('../../output/discordMarkdown');

module.exports = {
    name: 'inspiration',
    args: true,
    description: 'Logs an information about an awarded inspiration to one of the characters.',
    mainMessage: (characterName, reason) =>`${bold(characterName)} was awarded an inspiration for ${reason}. 🧠`,
    async execute(messageChannel, [characterName, reason]) {
        const message = this.mainMessage(characterName, reason);
        return await messageChannel.send(message);
    }
}