const { getRandomInteger } = require('../../utils/random');

module.exports = {
    name: 'addxp',
    args: true,
    description: 'Logs an information about an added experience to one of the characters.',
    mainMessage: (characterName, amount) =>`${characterName} received ${amount} XP. ⚔️`,
    additionalMessage: () => 'Nice! You are finally doing something.',
    async execute(messageChannel, [characterName, addedXp]) {
        let message = this.mainMessage(characterName, addedXp);

        if (getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage();
        }

        return await messageChannel.send(message);
    }
}