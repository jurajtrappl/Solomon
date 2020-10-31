// const dice = require('../../src/dice.js');
// const embed = require('../../src/embed.js');

// module.exports = {
//     name: 'rhd',
//     args: true,
//     description: 'Rolling hit dices.',
//     async execute(message, args, dbClient) {
//         await dbClient.connect();
//         const dndDb = dbClient.db("dnd");

//         if (args[0] === 'help') {
//             return await message.reply({ embed: embed.getHelpEmbed(dbClient, this.name) });
//         } else {
//             if (isNaN(args[0])) {
//                 return await message.reply('Invalid number of hit dices.');
//             } else if (args[0] > 0) {
//                 //get character name
//                 let resultName = await dndDb.collection("players").find({
//                     discordID: message.author.id
//                 }).toArray();
//                 let characterName = resultName[0]["characters"][0];

//                 //get character sheet
//                 let resultSheet = await dndDb.collection("characters").find({
//                     characterName: characterName
//                 }).toArray();
//                 let sheet = resultSheet[0];

//                 const hitDiceCount = sheet["hitDice"]["count"];
//                 const hitDiceSpent = Number(sheet["hitDice"]["spent"]);
//                 const hitDiceActual = hitDiceCount - hitDiceSpent;

//                 if (Number(args[0]) + hitDiceSpent > hitDiceCount) {
//                     return await message.reply(`You can't use that many hit dices. (${hitDiceActual} hit dice${(hitDiceActual != 1) ? 's' : ''} left)`);
//                 }

//                 //update the spent dices
//                 let newHitDiceSpentValue = {
//                     $set: {
//                         hitDice: {
//                             spent: hitDiceSpent + Number(args[0])
//                         }
//                     }
//                 }

//                 dndDb.collection("characters").updateOne({
//                         characterName: characterName
//                     }, newHitDiceSpentValue,
//                     (err) => {
//                         if (err) throw err;
//                     });

//                 //create the roll expression
//                 const constitutionModifier = Math.floor((sheet['abilities']['Constitution'] - 10) / 2);
//                 const hitDiceType = sheet['hitDice']['type'];
//                 const hitDicesToRoll = args[0];
//                 const expr = `${hitDicesToRoll}d${hitDiceType}+${hitDicesToRoll * constitutionModifier}`;
//                 const hitDicesLeft = hitDiceCount - hitDiceSpent - args[0];

//                 try {
//                     const expressionDice = new dice.ExpressionDice(expr);
//                     const rollEmbed = embed.hitDiceEmbed(characterName, expr, expressionDice.roll(), hitDicesToRoll, hitDicesLeft);
//                     return await message.reply({
//                         embed: rollEmbed
//                     });
//                 } catch (err) {
//                     return await message.reply(err);
//                 }
//             } else {
//                 return await message.reply('ty beťar jeden :smile:.')
//             }
//         }
//     }
// }