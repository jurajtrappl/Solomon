const { createGameDate } = require('../../calendar/gameDate');
const { bold, italic } = require('../../output/discordMarkdown');

module.exports = {
    name: 'session',
    args: true,
    description: 'Logs an information about a change of someone\'s time.',
    delimiterMessage: () => `----------------------------------------------------------`,
    mainMessageStart: (characterNames) => `Starting a new session with ${characterNames.map(characterName => bold(characterName)).join()}.`,
    mainMessageEnd: (characterNames) => `Ending a session with ${characterNames.map(characterName => bold(characterName)).join()}.`,
    characterSpecificMessage: (characterName, location, currentTime) => `For ${bold(characterName)} is ${currentTime} and the location is ${italic(location)}.`,
    async execute(messageChannel, [flag, characterNames, locations, dateTimes]) {
        await messageChannel.send(this.delimiterMessage());

        if (flag == 'start') {
            await messageChannel.send(this.mainMessageStart(characterNames));
        } else {
            await messageChannel.send(this.mainMessageEnd(characterNames));
        }

        //print each characters locations and date time
        for (const characterName of characterNames) {
            const currentTime = createGameDate(dateTimes[characterName]);
            await messageChannel.send(this.characterSpecificMessage(characterName, locations[characterName], currentTime.formattedDateTime()));
        }

        return await messageChannel.send(this.delimiterMessage());
    }
}