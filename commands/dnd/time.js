// const db = require('../../src/db.js');
// const dbSettings = require('../../data/dbSetting.json');
// const calendar = require('../../data/calendar.json');
// const embed = require('../../src/embed.js');
// const helpEmbeds = require('../../data/helpEmbeds.json');
// const settings = require('../../settings.json');
// const sheetsSettings = require('../../sheets/sheetsSettings.json');

// findNextDay = (currentDay, currentMonthName, currentYear, numberOfDays) => {
//     //initialiaze starting month number
//     let monthNumber = calendar['months'].indexOf(currentMonthName);

//     let currentMonthLength = 0;
//     let monthLengths = Object.values(calendar['month_len']);

//     let nextMonthName = currentMonthName;
//     let nextYear = currentYear;
//     while (numberOfDays >= 0) {
//         currentMonthLength = monthLengths[monthNumber];

//         if (numberOfDays - currentMonthLength > 0) {
//             //1+ month left
//             numberOfDays -= currentMonthLength;
//         }
//         else {
//             //update day number and month name
//             let nextDayNumber = currentDay;
//             if (currentDay + numberOfDays > currentMonthLength) {
//                 nextDayNumber = numberOfDays - (currentMonthLength - currentDay);
//                 nextMonthName = calendar['months'][(monthNumber + 1) % calendar['n_months']];
//             }
//             else {
//                 nextDayNumber += numberOfDays;
//                 nextMonthName = calendar['months'][monthNumber];
//             }

//             return {
//                 'new_day_num': nextDayNumber,
//                 'new_month_name': nextMonthName,
//                 'new_year': nextYear
//             }
//         }

//         //update month number
//         monthNumber = (monthNumber + 1) % calendar['n_months'];

//         //check for a new year
//         if (monthNumber == 0) {
//             nextYear++;
//         }
//     }
// }

// module.exports = {
//     name: 'time',
//     args: true,
//     description: 'Set current time.',
//     tableName: 'time',
//     async execute(message, args, connection) {
//         const timeTable = new db.Table(connection, this.tableName);
//         const timeTableKeys = dbSettings['tableKeys'][this.tableName];
//         console.log(message);
//         //a user wants to display time & location
//         if (args.length == 0) {
//             const characterName = sheetsSettings[message.author.id];
//             timeTable.selectWhere(timeTableKeys.slice(2), 'character_name', characterName, async (result) => {
//                 if (result.length > 0) {
//                     const { hours, minutes, day, month, year, location } = result[0];
//                     return message.channel.send(
//                         {
//                             embed: embed.makeEmbed(
//                                 'Current game information',
//                                 ['Time', 'Date', 'Location'],
//                                 [`${hours}:${(minutes < 10) ? `0${minutes}` : `${minutes}`}`, `${day}.${month}, ${year}`, location]
//                             )
//                         }
//                     );
//                 }
//                 else {
//                     return await message.reply('No time data.');
//                 }
//             })
//         }
//         //print help embed
//         else if (args[0] == 'help') {
//             return message.channel.send(
//                 {
//                     embed: helpEmbeds[this.name]
//                 }
//             );
//         }
//         else {
//             //update time table - DM only
//             if (message.author.id == settings.dmID) {
//                 let characterName = args[0];

//                 //update time or location for every character
//                 if(characterName == 'all') {
//                     const players = Object.values(sheetsSettings);
//                     players.forEach(p => {
//                         this.execute(message, [p, args[1], (args[1] != 'l') ? parseInt(args[2]) : args.slice(2).join(' ')], connection);
//                     })
//                     return;
//                 }

//                 //update time or location for single player only
//                 if (args[1] == 'h') {
//                     timeTable.selectWhere(timeTableKeys.slice(2), 'character_name', characterName, async (result) => {
//                         if (result.length > 0) {
//                             //update hours
//                             const { hours, minutes, day, month, year } = result[0];
//                             const hourIncrement = parseInt(args[2]);

//                             timeTable.update(['hours'], [(hours + hourIncrement) % 24], 'character_name', characterName);

//                             if (hours + hourIncrement > 23) {
//                                 //update day, month, year
//                                 const { new_day_num, new_month_name, new_year } = findNextDay(day, month, year, Math.floor((hours + hourIncrement) / 24));

//                                 timeTable.update(['day', 'month', 'year'], [new_day_num, new_month_name, new_year], 'character_name', characterName);
//                             }

//                         }
//                         else {
//                             return await message.reply('No time data.');
//                         }
//                     });
//                 }
//                 else if (args[1] == 'm') {
//                     timeTable.selectWhere(['minutes'], 'character_name', characterName, async (result) => {
//                         if (result.length > 0) {
//                             const minutes = result[0]['minutes'];
//                             const minutesIncrement = parseInt(args[2]);

//                             timeTable.update(['minutes'], [(minutes + minutesIncrement) % 60], 'character_name', characterName);

//                             if (minutes + minutesIncrement > 59) {
//                                 //update hours
//                                 this.execute(message, ['h', Math.floor((minutes + minutesIncrement) / 60)], connection);
//                             }
//                         }
//                         else {
//                             return await message.reply('No time data.');
//                         }

//                     });
//                 }
//                 else if (args[1] == 'l') {
//                     timeTable.update(['location'], [args.slice(2).join(' ')], 'character_name', characterName);
//                 }
//             }
//             else {
//                 return message.channel.send('ty beťar jeden :smile:.');
//             }
//         }
//     }
// }