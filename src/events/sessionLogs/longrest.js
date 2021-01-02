const { bold } = require('../../output/discordMarkdown');

module.exports = {
    name: 'longrest',
    args: true,
    description: 'Logs an information about a longrest of one of the characters.',
    successfulLongRest: (characterName, datetime, location) =>
        `${bold(characterName)} successfully finished a long rest in ${location}. It is now ${datetime.formattedDateTime()}.`,
    unsuccessfulLongRest: (characterName, datetime, location, hours) =>
        `${bold(characterName)} has not successfully finished a long rest in ${location}. ${bold(characterName)} wakes up after ${hours} hours. It is now ${datetime.formattedDateTime()}.`,
    async execute(messageChannel, [characterName, wasSuccessful, datetime, location, hours]) {
        let message = '';
        if (wasSuccessful) {
            message = this.successfulLongRest(characterName, datetime, location);
        } else {
            message = this.unsuccessfulLongRest(characterName, datetime, location, hours);
        }

        return await messageChannel.send(message);
    }
}