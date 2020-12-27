const { GameCalendar } = require('../calendar/gameCalendar');
const { MessageEmbed } = require('discord.js');

//creates an embed for rolling ability checks or saving throws using adv/dadv
makeAdvOrDisadvEmbed = (characterName, color, flag, expr, title, first, second) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .addFields({
            name: 'Rolling',
            value: expr
        }, {
            name: 'First attempt',
            value: `${first.visual} = ${first.total}`,
            inline: true
        }, {
            name: 'Second attempt',
            value: `${second.visual} = ${second.total}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} rolls ${(flag == 'adv') ? ((Number(first.total) >= Number(second.total)) ? first.total : second.total) : ((Number(first.total) >= Number(second.total)) ? second.total : first.total)}.`
        });

makeHealEmbed = (characterName, color, expr, title, { total, visual }, currentHP, maxHP) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .addFields({
            name: 'Rolling',
            value: expr,
            inline: true
        }, {
            name: 'Total',
            value: `${visual} = ${total}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} heals for ${total} :heart:. (${currentHP}/${maxHP}).`
        });

makeHelpEmbed = (color, embedFromDb) =>
    new MessageEmbed(embedFromDb)
        .setColor(color);

//creates an embed for rolling hit dices
makeHitDiceEmbed = (characterName, color, expression, { total, visual }, hitDicesCount, hitDicesLeft) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(`***${characterName} spends ${hitDicesCount} hit dice${(hitDicesCount != 1) ? 's' : ''}***`)
        .addFields({
            name: 'Rolling',
            value: `${expression}`,
            inline: true
        }, {
            name: 'Total',
            value: `${visual} = ${total}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} regains ${total} HP :heart:. (${hitDicesLeft} hit dice${(hitDicesLeft != 1) ? 's' : ''} left)`
        });

//creates an embed for rolling ability checks or saving throws without adv/dadv
makeNormalRollEmbed = (characterName, color, expr, title, { total, visual }) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .addFields({
            name: 'Rolling',
            value: expr,
            inline: true
        }, {
            name: 'Total',
            value: `${visual} = ${total}`,
            inline: true
        }, {
            name: 'Result',
            value: `${characterName} rolls ${total}.`
        });

makeFields = (names, values) => {
    const fields = [];
    for (let i = 0; i < names.length; i++) {
        fields.push({
            name: names[i],
            value: values[i]
        });
    }
    return fields;
}

makeObjectEmbed = (color, obj, title) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .addFields(
            makeFields(Object.keys(obj), Object.values(obj))
        );

makeSheetEmbed = (color, sheet) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle('Character sheet')
        .addFields({
            name: 'Abilities',
            value: `Strength: ${sheet.abilities.Strength}
                                Dexterity: ${sheet.abilities.Dexterity}
                                Constitution: ${sheet.abilities.Constitution}
                                Intelligence: ${sheet.abilities.Intelligence}
                                Wisdom: ${sheet.abilities.Wisdom}
                                Charisma: ${sheet.abilities.Charisma}`
        }, {
            name: 'Class',
            value: sheet.class
        }, {
            name: 'Current HP',
            value: sheet.currentHP
        }, {
            name: 'Hit dice',
            value: `Type: 1d${sheet.hitDice.type}
                                Count: ${sheet.hitDice.count}
                                Spent: ${sheet.hitDice.spent}`
        }, {
            name: 'Initiative',
            value: sheet.initiative
        }, {
            name: 'Level',
            value: sheet.level
        }, {
            name: 'Max HP',
            value: sheet.maxHP
        }, {
            name: 'Proficiency bonus',
            value: sheet.proficiencyBonus
        }, {
            name: 'Race',
            value: sheet.race
        }, {
            name: 'Saving throws proficiencies',
            value: `${Object.keys(sheet.savingThrows).filter(ability => sheet.savingThrows[ability]).join(' ')}`
        }, {
            name: 'Skills proficiencies',
            value: `${Object.keys(sheet.skills).filter(skill => sheet.skills[skill].prof).join(' ')}`
        }, {
            name: 'Speed',
            value: sheet.speed
        }, {
            name: 'XP',
            value: sheet.xp
        });

spellSlotsFields = (spellslots) => {
    const fields = [];

    for (let spellSlotLevel in spellslots.total) {
        const total = spellslots.total[spellSlotLevel];
        const expended = spellslots.expended[spellSlotLevel];
        
        fields.push({
            name: `${Number(spellSlotLevel) + 1}. level`,
            value: `${total - expended}/${total}`
        });
    }

    return fields;
}

makeSpellSlotsEmbed = (color, spellslots) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle('Spell slots')
        .addFields(spellSlotsFields(spellslots));

makeTimeEmbed = (color, time) => {
    const currentTime = new GameCalendar(time.datetime);
    const lastLongRest = new GameCalendar(time.lastLongRest);

    return new MessageEmbed()
        .setColor(color)
        .setTitle('Date, time and location')
        .addFields({
            name: 'Date & time:',
            value: `${currentTime.getFormattedDate()}, ${currentTime.getFormattedTime()}`,
        }, {
            name: 'Location',
            value: time.location,
        }, {
            name: 'Last long rest',
            value: `${lastLongRest.getFormattedDate()}, ${lastLongRest.getFormattedTime()}`,
        });
}

module.exports = {
    makeAdvOrDisadvEmbed,
    makeHealEmbed,
    makeHelpEmbed,
    makeHitDiceEmbed,
    makeNormalRollEmbed,
    makeObjectEmbed,
    makeSheetEmbed,
    makeSpellSlotsEmbed,
    makeTimeEmbed
}