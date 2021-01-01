const { bold } = require('../../output/discordMarkdown');
const { getRandomInteger } = require('../../utils/random');

module.exports = {
    name: 'heal',
    args: true,
    description: 'Logs an information about one\'s character healing.',
    additionalMessage: () => 'Try to not lose it again, you braindead.',
    mainMessage: (characterName, healAmount, healItem, newHP) =>
        `${bold(characterName)} heals for ${healAmount} ❤️ using ${healItem} potion. Now has ${bold(characterName)} ${newHP} ❤️.`,
    async execute(messageChannel, [characterName, healAmount, healItem, newHP]) {
        let message = this.mainMessage(characterName, healAmount, healItem, newHP);

        if (getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage(); 
        }

        return await messageChannel.send(message);
    }
}