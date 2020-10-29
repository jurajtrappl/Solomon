// const characterAdv = require('../../data/characterAdvancement.json');
// const db = require('../../src/db.js');
// const dbSettings = require('../../data/dbSetting.json');
// const helpEmbeds = require('../../data/helpEmbeds.json');

// module.exports = {
//     name: 'profile',
//     args: false,
//     description: 'Shows information about a character.',
//     tableName: 'characters',
//     async execute(message, args, connection) {
//         if (args[0] == 'help') {
//             return await message.reply(
//                 {
//                     embed: helpEmbeds[this.name]
//                 }
//             )
//         }
//         else {
//             const charactersTable = new db.Table(connection, this.tableName);
//             const charactersTableKeys = dbSettings['tableKeys'][this.tableName];

//             charactersTable.selectWhere(charactersTableKeys.slice(1), 'character_name', args[0], async (result) => {
//                 if (result.length > 0) {
//                     //find next level exp count
//                     const isNextLevelXp = (exp) => exp > result[0]['xp'];
//                     const nextLevelXp = Object.values(characterAdv['xp']).findIndex(isNextLevelXp);

//                     //send profile embed
//                     return await message.reply(
//                         {
//                             embed: {
//                                 color: '#2ef729',
//                                 title: result[0]['character_name'],
//                                 description: 'Character info',
//                                 thumbnail: result[0]['thumbnail'],
//                                 fields: [
//                                     { name: 'Level', value: result[0]['lvl'] },
//                                     { name: 'XP', value: `${result[0]['xp']}/${characterAdv['xp'][nextLevelXp+1]}` },
//                                     { name: 'Class', value: result[0]['character_class'] },
//                                     { name: 'Race', value: result[0]['character_race'] },
//                                     { name: 'Maximum HP', value: result[0]['maxhp'] },
//                                     { name: 'Speed', value: result[0]['speed'] }
//                                 ]
//                             }
//                         }
//                     )
//                 }
//                 else {
//                     return await message.reply('You are not a player.');
//                 }
//             });
//         }
//     }
// }