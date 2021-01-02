const calendar = require('./calendar.json');

const createGameDate = (jsonString) => {
    const obj = JSON.parse(jsonString);
    return {
        day: obj.day,
        month: obj.month,
        year: obj.year,
        hours: obj.hours,
        minutes: obj.minutes,
        formattedDate() {
            return `${this.day}. ${calendar.months[this.month]} ${this.year}`;
        },
        formattedTime() {
            return `${this.hours}:${this.minutes < 10 ? `0${this.minutes}` : this.minutes}`;
        },
        formattedDateTime() {
            return `${this.formattedDate()}, ${this.formattedTime()}`;
        },
        incrementYear() {
            this.year++;
        },
        incrementMonth() {
            if (this.month == calendar.months.length - 1) {
                this.month = 0;
                this.incrementYear();
            } else {
                this.month++;
            }
        },
        incrementDay() {
            if (this.day == calendar.monthLength[this.month]) {
                this.day = 1;
                this.incrementMonth();
            } else {
                this.day++;
            }
        },
        incrementHour() {
            if (this.hours == calendar.hoursInDay - 1) {
                this.hours = 0;
                this.incrementDay();
            } else {
                this.hours++;
            }
        },
        addHours(hoursToAdd) {
            while (hoursToAdd > 0) {
                this.incrementHour();
                hoursToAdd--;
            }
        },
        addMinutes(minutesToAdd) {
            const minutesOverHours = minutesToAdd % calendar.minutesInHour;

            if (this.minutes + minutesOverHours > calendar.minutesInHour) {
                this.minutes = this.minutes + minutesOverHours - calendar.minutesInHour;
                this.incrementHour();
            } else {
                this.minutes += minutesOverHours;
            }

            this.addHours((minutesToAdd - minutesOverHours) / calendar.minutesInHour)
        }
    }
}

//returns a difference between two dates in minutes
const gameDateDifference = (firstDate, secondDate) => {
    //lexicographical sort
    const [olderDate, newerDate] = [firstDate, secondDate].sort((firstDate, secondDate) =>
        firstDate.year - secondDate.year ||
        firstDate.month - secondDate.month ||
        firstDate.day - secondDate.day ||
        firstDate.hours - secondDate.hours ||
        firstDate.minutes - secondDate.minutes
    );

    let minutesBetween = 0;
    const minutesInDay = calendar.hoursInDay * calendar.minutesInHour;

    //years diff
    if (olderDate.year != newerDate.year) {
        const diffYears = newerDate.year - olderDate.year;
        if (diffYears > 1) {
            minutesBetween += (diffYears - 1) * calendar.yearLength * minutesInDay;
        }
    }

    //month diff
    if (olderDate.month != newerDate.month) {
        //months diff in between them
        const numOfMonths = calendar.months.length;
        const maxMonthNum = numOfMonths - 1;

        let monthFromNext = (olderDate.month == maxMonthNum) ? 0 : olderDate.month + 1;
        const monthToPrevious = (newerDate.month == 0) ? maxMonthNum : newerDate.month;

        while (monthFromNext != monthToPrevious) {
            minutesBetween += calendar.monthLength[monthFromNext] * minutesInDay;
            monthFromNext = (monthFromNext == maxMonthNum) ? 0 : monthFromNext + 1;
        }
    }

    //days diff
    if (olderDate.day != newerDate.day) {
        minutesBetween += (newerDate.day - olderDate.day) * minutesInDay;
    }

    //hours diff
    if (olderDate.hours != newerDate.hours) {
        minutesBetween += (newerDate.hours - olderDate.hours) * calendar.minutesInHour;
    }

    //minutes diff
    if (olderDate.minutes != newerDate.minutes) {
        minutesBetween += newerDate.minutes - olderDate.minutes;
    }

    return minutesBetween;
}

module.exports = {
    createGameDate,
    gameDateDifference
}