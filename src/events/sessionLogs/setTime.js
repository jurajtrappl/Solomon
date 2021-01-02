const { bold } = require('../../output/discordMarkdown');
const { createGameDate } = require('../../calendar/gameDate');

module.exports = {
    name: 'setTime',
    args: true,
    description: 'Logs an information about a change of someone\'s time.',
    mainMessage: (characterName, newTime) => `For ${bold(characterName)} is ${newTime}. ⌛`,
    async execute(messageChannel, [logTimes]) {
        let time = {};
        let message = '';
        for (const [characterName, timeData] of Object.entries(logTimes)) {
            time = createGameDate(timeData);
            message = this.mainMessage(characterName, time.formattedDateTime());
            await messageChannel.send(message);
        }
        return;
    }
}