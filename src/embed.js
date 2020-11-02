const {
    MessageEmbed
} = require('discord.js');

//creates an embed for rolling ability checks or saving throws using adv/dadv
advOrDisadvEmbed = (characterName, flag, expr, title, {
        first,
        second
    }) =>
    new MessageEmbed()
    .setColor('#00ff00')
    .setTitle(title)
    .addFields({
        name: 'Rolling',
        value: expr
    }, {
        name: 'First attempt',
        value: first.join(' = '),
        inline: true
    }, {
        name: 'Second attempt',
        value: second.join(' = '),
        inline: true
    }, {
        name: 'Result',
        value: `${characterName} rolls ${(flag == 'adv') ? ((Number(first[1]) >= Number(second[1])) ? first[1] : second[1]) : ((Number(first[1]) >= Number(second[1])) ? second[1] : first[1])}.`
    });

//creates an embed for rolling ability checks or saving throws without adv/dadv
normalRollEmbed = (characterName, expr, title, result) =>
    new MessageEmbed()
    .setColor('#00ff00')
    .setTitle(title)
    .addFields({
        name: 'Rolling',
        value: expr,
        inline: true
    }, {
        name: 'Total',
        value: result,
        inline: true
    }, {
        name: 'Result',
        value: `${characterName} rolls ${result.split('=')[1]}.`
    });

//creates an embed for rolling hit dices
hitDiceEmbed = (characterName, expression, { visual, totalRoll }, hitDicesCount, hitDicesLeft) =>
    new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(`***${characterName} spends ${hitDicesCount} hit dice${(hitDicesCount != 1) ? 's' : ''}***`)
        .addFields({
            name: 'Rolling',
            value: `${expression}`,
            inline: true
        }, {
            name: 'Total',
            value: `${visual}= ${totalRoll}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} regains ${visual} HP :heart:. (${hitDicesLeft} hit dice${(hitDicesLeft != 1) ? 's' : ''} left)`
        });

module.exports = {
    advOrDisadvEmbed,
    normalRollEmbed,
    hitDiceEmbed
}