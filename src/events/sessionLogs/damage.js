module.exports = {
    name: 'damage',
    args: true,
    description: 'Logs an information about one\'s character healing.',
    mainMessage: function (characterName, damageAmount) {
        return `${characterName} just lost ${damageAmount} ❤️.`;
    },
    lowDamageMessages: ['That is it?', 'Well, that was a childish attack.', 'Why are you fighting noobs?'],
    normalDamageMessages: ['You got it, dumbo.', 'Clapped!', 'That will hurt tommorrow.'],
    bigDamageMessages: ['LOL!', 'Bang!'],
    lethalDamageMessages: ['Oh, he ded!', 'Daaaaamn!', 'Rest in peace, bro.'],
    additionalMessage: function (damage) {
        let randomIndex = 0;
        if (damage < 10) {
            randomIndex = this.getRandomInteger(0, this.lowDamageMessages.length);
            return this.lowDamageMessages[randomIndex];
        } else if (damage >= 10 && damage < 30) {
            randomIndex = this.getRandomInteger(0, this.normalDamageMessages.length);
            return this.normalDamageMessages[randomIndex];
        } else if (damage >= 30 && damage < 50) {
            randomIndex = this.getRandomInteger(0, this.bigDamageMessages.length);
            return this.bigDamageMessages[randomIndex];
        } else {
            randomIndex = this.getRandomInteger(0, this.lethalDamageMessages.length);
            return this.lethalDamageMessages[randomIndex];
        }
    },
    getRandomInteger: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    async execute(messageChannel, [characterName, damageAmount ]) {
        let message = this.mainMessage(characterName, damageAmount);

        if (this.getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage(Number(damageAmount));
        }

        return await messageChannel.send(message);
    }
}