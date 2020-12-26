const calendar = require('./calendar.json');

class GameCalendar {
    constructor(datetime) {
        this.datetime = new Date(datetime);
    }

    getFormattedDate() {
        const day = this.datetime.getDate();
        const year = this.datetime.getFullYear();

        const gameCalendarWeekDay = calendar.weekdays[this.datetime.getDay()];
        const gameCalendarMonth = calendar.months[this.datetime.getMonth()];

        return `${gameCalendarWeekDay} ${day}. ${gameCalendarMonth} ${year}`;
    }

    getFormattedTime() {
        const hours = this.datetime.getHours();
        let minutes = this.datetime.getMinutes();

        if (Number(minutes) < 10) {
            minutes = `0${minutes}`;
        }

        return `${hours}:${minutes}`;
    }

    getFormattedDateTime() {
        return `${this.getFormattedDate()}, ${this.getFormattedTime()}`;
    }
}

module.exports = {
    GameCalendar
}