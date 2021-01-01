const { bold } = require('../../output/discordMarkdown');
const { GameCalendar } = require("../../calendar/gameCalendar");

module.exports = {
    name: 'longrest',
    args: true,
    description: 'Logs an information about a longrest of one of the characters.',
    successfulLongRest: (characterName, datetime, location) =>
        `${bold(characterName)} successfully finished a long rest in ${location}. It is now ${datetime.getFormattedDateTime()}.`,
    unsuccessfulLongRest: (characterName, datetime, location, hours) =>
        `${bold(characterName)} has not successfully finished a long rest in ${location}. ${bold(characterName)} wakes up after ${hours} hours. It is now ${datetime.getFormattedDateTime()}.`,
    async execute(messageChannel, [characterName, wasSuccessful, datetime, location, hours]) {
        let message = '';
        const formattedDateTime = new GameCalendar(datetime);
        if (wasSuccessful) {
            message = this.successfulLongRest(characterName, formattedDateTime, location);
        } else {
            message = this.unsuccessfulLongRest(characterName, formattedDateTime, location, hours);
        }

        return await messageChannel.send(message);
    }
}