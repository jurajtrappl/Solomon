const { bold } = require('../../output/discordMarkdown');
const { GameCalendar } = require('../../calendar/gameCalendar');

module.exports = {
    name: 'setTime',
    args: true,
    description: 'Logs an information about a change of someone\'s time.',
    mainMessage: (characterName, newTime) =>`For ${bold(characterName)} is ${newTime}. ⌛`,
    async execute(messageChannel, [characterNames, logTimes]) {
        let gameCalendar = {};
        let message = '';
        for(let characterName of characterNames) {
            gameCalendar = new GameCalendar(logTimes[characterName]);
            message = this.mainMessage(characterName, gameCalendar.getFormattedDateTime());
            await messageChannel.send(message);
        }
        return;
    }
}