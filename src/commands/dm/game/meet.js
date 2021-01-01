module.exports = {
    name: 'meet',
    description: 'Emits an event that describes who met certain characters.',
    args: {
        limitCount: false,
        specifics: [
            [{ type: 'characterNames' }, { type: 'string' }]
        ]
    },
    async execute(_message, [characterNamesArg, people, ...placeArg], _mongo, discordClient) {
        const characterNames = characterNamesArg.split(',');
        const place = placeArg.join(' ');        
        //log
        discordClient.emit('sessionLog', 'meet', [characterNames, people, place]);
    },
};
