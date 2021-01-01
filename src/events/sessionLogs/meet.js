const { bold } = require('../../output/discordMarkdown');
const { plural } = require('../../output/lang');

module.exports = {
    name: 'meet',
    args: true,
    description: 'Logs an information about meeting someone.',
    mainMessage: (characterNames, people, place) => 
        `${characterNames.map(characterName => bold(characterName)).join()} ${plural('meet', characterNames)} ${people} in the ${place}.`,
    async execute(messageChannel, [characterNames, people, place]) {
        const message = this.mainMessage(characterNames, people, place);
        return await messageChannel.send(message);
    }
}