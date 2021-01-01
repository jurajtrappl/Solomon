const { bold } = require('../../output/discordMarkdown');
const { plural } = require('../../output/lang');

module.exports = {
    name: 'setLocation',
    args: true,
    description: 'Logs an information about change of location.',
    mainMessage: (characterNames, newLocation) =>`${characterNames.map(characterName => bold(characterName)).join()} ${plural('move', characterNames)} to ${newLocation}. 🐎`,
    async execute(messageChannel, [characterNames, newLocation]) {
        const message = this.mainMessage(characterNames, newLocation);
        return await messageChannel.send(message);
    }
}