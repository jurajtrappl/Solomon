// const dice = require('../../src/dice.js');
// const embeds = require('../../src/embed.js');

// module.exports = {
//     name: 'rac',
//     args: true,
//     description: 'Roll an ability check.',
//     modifier: (score) => Math.floor((score - 10) / 2),
//     calculateSkillBonus: function (sheet, skillName) {
//         const skillAbility = skills[skillName]['ability'];
//         let bonus = this.modifier(sheet['abilities'][skillAbility]);

//         //check for proficiency
//         if (sheet['skills'][skillName]['prof']) {
//             bonus += sheet['proficiencyBonus'];
//         }

//         //check for double proficiency
//         if (sheet['doubleProf'].indexOf(skillName) != -1) {
//             bonus += sheet['proficiencyBonus'];
//         }

//         return bonus;
//     },
//     async execute(message, args, dbClient) {
//         await dbClient.connect();
//         const dndDb = dbClient.db("dnd");

//         if (args[0] === 'help') {
//             dndDb.collection("helpEmbeds").find({
//                 commandName: this.name
//             }).toArray(async (err, result) => {
//                 if (err) throw err;
//                 return await message.reply({
//                     embed: result[0],
//                 });
//             });
//         } else if (args.length == 0 || Object.keys(skills).indexOf(args[0]) == -1) {
//             return await message.reply({
//                 embed: embeds.allSkillNamesEmbed()
//             });
//         } else {
//             //get character name
//             let resultName = await dndDb.collection("players").find({
//                 discordID: message.author.id
//             }).toArray();
//             let characterName = resultName[0]["characters"][0];

//             //get character sheet
//             let resultSheet = await dndDb.collection("characters").find({
//                 characterName: characterName
//             }).toArray();
//             let sheet = resultSheet[0];
//             const skillName = args[0];

//             //write the title
//             let embedTitle = `${skills[skillName]['name']} ability check`;;

//             //calculate the bonus
//             let bonus = this.calculateSkillBonus(sheet, args[0]);

//             //create a roll expression
//             let expr = `1d20${(bonus > 0) ? '+' : '-'}${Math.abs(bonus)}`;
//             let expressionDice = new dice.ExpressionDice(expr);
//             let rollEmbed = null;

//             //a basic roll without adv/dadv and bonus expression
//             if (args.length == 1) {
//                 rollEmbed = embeds.normalRollEmbed(characterName, expr, embedTitle, expressionDice.roll());
//             }

//             //either bonus expression or adv/dadv
//             if (args.length == 2) {
//                 const arguments = args.slice(1).join('');
//                 if (args[1] == 'adv' || args[1] == 'dadv') {
//                     embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
//                     rollEmbed = embeds.advOrDisadvEmbed(characterName, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
//                 } else if (arguments.startsWith('(') && arguments.endsWith(')')) {
//                     const bonusExpr = arguments.substring(1, arguments.length - 1);
//                     expr += bonusExpr;
//                     expressionDice = new dice.ExpressionDice(expr);
//                     rollEmbed = embeds.normalRollEmbed(characterName, expr, embedTitle, expressionDice.roll());
//                 } else {
//                     return await message.reply('There is an error with adv/dadv.');
//                 }
//             }

//             //a basic roll with adv/dadv and bonus expression
//             if (args.length == 3) {
//                 embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;

//                 const arguments = args.slice(2).join('');
//                 const bonusExpr = arguments.substring(1, arguments.length - 1);
//                 expr += bonusExpr;
//                 expressionDice = new dice.ExpressionDice(expr);
//                 rollEmbed = embeds.advOrDisadvEmbed(characterName, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
//             }

//             return await message.reply({
//                 embed: rollEmbed
//             });
//         }
//     }
// }