const { GameCalendar } = require("../../calendar/gameCalendar");

module.exports = {
    name: 'longrest',
    args: true,
    description: 'Logs an information about a longrest of one of the characters.',
    successfulLongRest: function(characterName, datetime, location) {
        return `${characterName} successfully finished a long rest in ${location}. It is now ${datetime.getFormattedDateTime()}.`
    },
    unsuccessfulLongRest: function(characterName, datetime, location, hours) {
        return `${characterName} has not successfully finished a long rest in ${location}. ${characterName} wakes up after ${hours} hours. It is now ${datetime.getFormattedDateTime()}.`
    },
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