module.exports = {
    name: 'milestone',
    description: 'Emits an event that describes a reached milestone.',
    args: {
        limitCount: false,
        specifics: [
            [{ type: 'characterNames' }, { type: 'string' }]
        ]
    },
    async execute(_message, [characterNamesArg, ...milestoneArg], _mongo, discordClient) {
        const characterNames = characterNamesArg.split(',');
        const milestone = milestoneArg.join(' ');        
        //log
        discordClient.emit('sessionLog', 'milestone', [characterNames, milestone]);
    },
};
