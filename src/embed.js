const Discord = require('discord.js');

const getHelpEmbed = async (dbClient, commandName) => {
    await dbClient.connect();
    const dndDb = dbClient.db("dnd");

    let resultEmbed = await dndDb.collection("helpEmbeds").find({
        commandName: commandName
    }).toArray();
    console.log(resultEmbed[0]);
    return resultEmbed[0];
}

makeFields = (names, values) => {
    const fields = [];
    for (let i = 0; i < names.length; i++) {
        fields.push(
            {
                name: names[i],
                value: values[i]
            }
        )
    }
    return fields;
}

makeEmbed = (title, names, values) =>
    new Discord.MessageEmbed()
        .setColor('#0000ff')
        .setTitle(title)
        .addFields(
            makeFields(names, values)
        );

oneFieldEmbed = (fieldName, title, result, key) =>
    new Discord.MessageEmbed()
        .setColor('#ff0000')
        .setTitle(title)
        .addField(fieldName, result.map(r => r[key]));

searchEmbed = (title, result, keys, isInlined) =>
    new Discord.MessageEmbed()
        .setColor('#ff0000')
        .setTitle(title)
        .addFields(
            keys.map(k => (
                { name: k, value: result[k], inline: isInlined }
                )
            )
        );

//display all the first words of skill names (keys in character sheets)
allSkillNamesEmbed = () =>
    new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle('__**List of all skill names**__')
        .addField('Skills', Object.keys(skills));

//display all the ability names (keys in character sheets)
allAbilityNamesEmbed = () =>
    new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle('__**List of all ability names**__')
        .addField('Abilities', Object.keys(abilities));

//creates an embed for rolling ability checks or saving throws using adv/dadv
advOrDisadvEmbed = (characterName, flag, expr, title, { first, second }) => 
    new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle(title)
        .addFields(
            { name: 'Rolling', value: expr },
            { name: 'First attempt', value: first.join(' = '), inline: true },
            { name: 'Second attempt', value: second.join(' = '), inline: true },
            { name: 'Result', value: `${characterName} rolls ${(flag == 'adv') ? ((Number(first[1]) >= Number(second[1])) ? first[1] : second[1]) : ((Number(first[1]) >= Number(second[1])) ? second[1] : first[1])}.` }
        );    

//creates an embed for rolling ability checks or saving throws without adv/dadv
normalRollEmbed = (characterName, expr, title, result) =>
    new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle(title)
        .addFields(
            { name: 'Rolling', value: expr, inline: true },
            { name: 'Total', value: result, inline: true },
            { name: 'Result', value: `${characterName} rolls ${result.split('=')[1]}.` }
        );

//creates an embed for rolling hit dices
hitDiceEmbed = (characterName, expression, result, hitDicesCount, hitDicesLeft) =>
    new Discord.MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`***${characterName} spends ${hitDicesCount} hit dice${(hitDicesCount != 1) ? 's' : ''}***`)
        .addFields(
            { name: 'Rolling', value: `${expression}`, inline: true },
            { name: 'Total', value: `${result}`, inline: true },
            { name: 'Result', value: `${characterName} regains ${result.split('=')[1]} HP :heart:. (${hitDicesLeft} hit dice${(hitDicesLeft != 1) ? 's' : ''} left)` }
        );

module.exports = {
    getHelpEmbed,
    oneFieldEmbed,
    makeEmbed,
    searchEmbed,
    advOrDisadvEmbed,
    normalRollEmbed,
    allAbilityNamesEmbed,
    allSkillNamesEmbed,
    hitDiceEmbed
}