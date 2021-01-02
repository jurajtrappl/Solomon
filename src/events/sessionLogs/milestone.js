const { bold } = require('../../output/discordMarkdown');

module.exports = {
    name: 'milestone',
    args: true,
    description: 'Logs an information about a reached milestone.',
    mainMessage: (characterNames, milestone) =>
        `${milestone} is a huge milestone in ${characterNames.map(characterName => `${bold(`${characterName}'s`)}`).join()} life. 🏆`,
    async execute(messageChannel, [characterNames, milestone]) {
        const message = this.mainMessage(characterNames, milestone);
        return await messageChannel.send(message);
    }
}