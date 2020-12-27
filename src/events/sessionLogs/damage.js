const { getRandomInteger } = require('../../utils/random');

module.exports = {
    name: 'damage',
    args: true,
    description: 'Logs an information about one\'s character healing.',
    lowDamageMessages: ['That is it?', 'Well, that was a childish attack.', 'Why are you fighting noobs?'],
    normalDamageMessages: ['You got it, dumbo.', 'Clapped!', 'That will hurt tommorrow.'],
    bigDamageMessages: ['LOL!', 'Bang!'],
    lethalDamageMessages: ['Oh, he ded!', 'Daaaaamn!', 'Rest in peace, bro.'],
    additionalMessage: (damage) => {
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
    mainMessage: (characterName, damageAmount) => `${characterName} just lost ${damageAmount} ❤️.`,
    async execute(messageChannel, [characterName, damageAmount ]) {
        let message = this.mainMessage(characterName, damageAmount);

        if (getRandomInteger(1, 100) <= 10) {
            message += this.additionalMessage(Number(damageAmount));
        }

        return await messageChannel.send(message);
    }
}