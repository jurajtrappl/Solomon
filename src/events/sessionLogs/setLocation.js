module.exports = {
    name: 'setLocation',
    args: true,
    description: 'Logs an information about change of location.',
    mainMessage: (characterNames, newLocation) =>`${characterNames.join()} move${characterNames.length == 1 ? 's' : ''} to ${newLocation}. 🐎`,
    async execute(messageChannel, [characterNames, newLocation]) {
        const message = this.mainMessage(characterNames, newLocation);
        return await messageChannel.send(message);
    }
}