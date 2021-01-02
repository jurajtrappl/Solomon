const calendar = require('./calendar.json');

//setup-only
const eventCalendarInit = () => {
    const eventCalendar = {};

    for (const year of calendar.worldYears) {
        eventCalendar[year] = yearInit();
    }

    return eventCalendar;
}

//setup-only
const yearInit = () => {
    const year = {};

    calendar.months.forEach((monthName, index) => {
        year[monthName] = new Array(calendar.monthLength[index]);
    });

    return year;
}

const createEvent = (day, month, year, hours, minutes, description) => {
    return {
        date: JSON.stringify({ day, month, year, hours, minutes }),
        description
    }
}

const createEventCalendar = (eventCalendarObj) => {
    return {
        calendar: eventCalendarObj.calendar,
        addEvent(day, month, year, hours, minutes, eventDescription) {
            const monthName = calendar.months[month - 1];
            if (this.calendar.hasOwnProperty(year)) {
                if (this.calendar[year].hasOwnProperty(monthName)) {
                    if (this.calendar[year][monthName].length > day && day > 0) {
                        if (this.calendar[year][monthName][day] == null) {
                            this.calendar[year][monthName][day] = new Array();
                        }

                        this.calendar[year][monthName][day].push(createEvent(day, month, year, hours, minutes, eventDescription));
                    }
                }
            }
        },
        findEvents(day, month, year) {
            const monthName = calendar.months[month - 1];
            if (this.calendar.hasOwnProperty(year)) {
                if (this.calendar[year].hasOwnProperty(monthName)) {
                    if (this.calendar[year][monthName].length > day && day > 0) {
                        return this.calendar[year][monthName][day];
                    }
                }
            }
        }

    }
}

module.exports = {
    eventCalendarInit,
    createEventCalendar
}