const { MessageEmbed } = require('discord.js');

//creates an embed for rolling ability checks or saving throws using adv/dadv
function advOrDisadvEmbed(characterName, flag, expr, title, first, second) {
    return new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(title)
        .addFields({
            name: 'Rolling',
            value: expr
        }, {
            name: 'First attempt',
            value: `${first.visual} = ${first.totalRoll}`,
            inline: true
        }, {
            name: 'Second attempt',
            value: `${second.visual} = ${second.totalRoll}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} rolls ${(flag == 'adv') ? ((Number(first.totalRoll) >= Number(second.totalRoll)) ? first.totalRoll : second.totalRoll) : ((Number(first.totalRoll) >= Number(second.totalRoll)) ? second.totalRoll : first.totalRoll)}.`
        });
}


function healEmbed(characterName, expr, title, { visual, totalRoll }, currentHP, maxHP) {
    return new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(title)
        .addFields({
            name: 'Rolling',
            value: expr,
            inline: true
        }, {
            name: 'Total',
            value: `${visual}= ${totalRoll}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} heals for ${totalRoll} :heart:. (${currentHP}/${maxHP}).`
        });
}

//creates an embed for rolling ability checks or saving throws without adv/dadv
function normalRollEmbed(characterName, expr, title, { visual, totalRoll }) {
    return new MessageEmbed()
        .setColor('#00ff00')
        .setTitle(title)
        .addFields({
            name: 'Rolling',
            value: expr,
            inline: true
        }, {
            name: 'Total',
            value: `${visual}= ${totalRoll}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} rolls ${totalRoll}.`
        });
}


//creates an embed for rolling hit dices
function hitDiceEmbed(characterName, expression, { visual, totalRoll }, hitDicesCount, hitDicesLeft) {
    return new MessageEmbed()
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
}


module.exports = {
    advOrDisadvEmbed,
    normalRollEmbed,
    healEmbed,
    hitDiceEmbed
}