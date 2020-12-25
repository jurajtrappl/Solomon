module.exports = {
    name: 'addxp',
    args: true,
    description: 'Logs an information about an added experience to one of the characters.',
    mainMessage: function (characterName, amount) {
        return `${characterName} received ${amount} XP. ⚔️`;
    },
    additionalMessage: function () {
        return 'Nice! You are finally doing something.'
    },
    getRandomInteger: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    async execute(messageChannel, [characterName, addedXp]) {
        let message = this.mainMessage(characterName, addedXp);

        if (this.getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage();
        }

        return await messageChannel.send(message);
    }
}