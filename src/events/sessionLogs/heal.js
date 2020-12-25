module.exports = {
    name: 'heal',
    args: true,
    description: 'Logs an information about one\'s character healing.',
    mainMessage: function (characterName, healAmount, healItem, newHP) {
        return `${characterName} heals for ${healAmount} ❤️ using ${healItem} potion. Now has ${characterName} ${newHP} ❤️.`;
    },
    additionalMessage: function () {
        return 'Try to not lose it again, you braindead.'
    },
    getRandomInteger: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    async execute(messageChannel, [characterName, healAmount, healItem, newHP]) {
        let message = this.mainMessage(characterName, healAmount, healItem, newHP);

        if (this.getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage(); 
        }

        return await messageChannel.send(message);
    }
}