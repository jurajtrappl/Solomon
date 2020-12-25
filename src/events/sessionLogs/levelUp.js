module.exports = {
    name: 'levelUp',
    args: true,
    description: 'Logs an information about reaching a new level of one of the characters.',
    mainMessage: function (characterName, newLvl) {
        return `${characterName} just leveled up! Good job. You are now ${newLvl}. level.`;
    },
    async execute(messageChannel, [characterName, newLvl]) {
        const message = this.mainMessage(characterName, newLvl);

        return await messageChannel.send(message);
    }
}