module.exports = {
    name: 'expend',
    args: true,
    description: 'Logs an information about expending of one of the character\'s spell slots.',
    mainMessage: function (characterName, spellSlotLevel, spellName) {
        return `${characterName} used one ${spellSlotLevel}. level spell slot to cast '${spellName}'.`;
    },
    async execute(messageChannel, [characterName, spellSlotLevel, spellName]) {
        const message = this.mainMessage(characterName, spellSlotLevel, spellName);

        return await messageChannel.send(message);
    }
}