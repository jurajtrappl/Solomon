const { bold } = require('../../output/discordMarkdown');
const { getRandomInteger } = require('../../utils/random');

module.exports = {
    name: 'addxp',
    args: true,
    description: 'Logs an information about an added experience to one of the characters.',
    mainMessage: (characterName, amount, enemies) =>
        `${bold(characterName)} received ${amount} XP for defeating ${enemies}. ⚔️`,
    additionalMessage: () => 'Nice! You are finally doing something.',
    async execute(messageChannel, [characterName, addedXp, enemies]) {
        let message = this.mainMessage(characterName, addedXp, enemies);

        if (getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage();
        }

        return await messageChannel.send(message);
    }
}