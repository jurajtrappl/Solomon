const { database } = require('../../../../settings.json');
const { createEventCalendar } = require('../../../calendar/eventCalendar');
const { NotFoundError, searchingObjType } = require('../../../err/errors');
const { makeEmptyEventDayEmbed, makeEventEmbed } = require('../../../output/embed');

module.exports = {
    name: 'event',
    description: 'Manages game event calendar.',
    args: {
        limitCount: false,
        specifics: [
            [{ type: 'number' }, { type: 'number' }, { type: 'number' }],
            [{ type: 'number' }, { type: 'number' }, { type: 'number' }, { type: 'number' }, { type: 'number' }]
        ]
    },
    async execute(message, args, mongo, _discordClient) {
        //get event calendar
        let eventCalendarDataFile = await mongo.tryFind(database.collections.data, { name: 'EventCalendar' });
        if (!eventCalendarDataFile) {
            throw new NotFoundError(searchingObjType.data, 'EventCalendar');
        }
        eventCalendarDataFile = eventCalendarDataFile.content;

        const eventCalendar = createEventCalendar(eventCalendarDataFile);

        if (args.length == 3) {
            const [ day, month, year ] = args;
            const events = eventCalendar.findEvents(Number(day), Number(month), Number(year));
            const color = message.member.displayHexColor;

            return await message.reply({
                embed: (events == null || events.length == 0) ? makeEmptyEventDayEmbed(color, day, month, year) : makeEventEmbed(color, events)
            });
        } else {
            const [ day, month, year, hours, minutes, ...eventDescriptionArgs ] = args;
            eventDescription = eventDescriptionArgs.join(' ');
            eventCalendar.addEvent(Number(day), Number(month), Number(year), Number(hours), Number(minutes), eventDescription);

            await mongo.updateOne(database.collections.data, { name: 'EventCalendar' }, { $set: { 'content': eventCalendar }});
        }
    }
};