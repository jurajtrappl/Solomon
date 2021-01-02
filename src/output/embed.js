const { bold } = require('./discordMarkdown');
const { boolToYesNo, plural } = require('./lang');
const { createGameDate } = require('../calendar/gameDate');
const { MessageEmbed } = require('discord.js');
const { months } = require('../calendar/calendar.json');

//creates an embed for rolling ability checks or saving throws using adv/dadv
const makeAdvOrDisadvEmbed = (characterName, color, rollExpression, title, [first, second]) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields(
            { name: 'Rolling', value: rollExpression },
            { name: 'First attempt', value: `${first.visual} = ${first.total}`, inline: true },
            { name: 'Second attempt', value: `${second.visual} = ${second.total}`, inline: true },
            { name: 'Result', value: `${characterName} rolls ${first.total}.` }
        );

const makeEmptyEventDayEmbed = (color, day, month, year) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(`Events on the ${day}. ${months[month - 1]} ${year}`)
        .addFields(
            { name: 'Empty', value: 'There are 0 events on this day' }
        );

const makeEventEmbed = (color, events) => {
    events.map(event => event.date = createGameDate(event.date));
    events.sort((a, b) => a.date.hours - b.date.hours || a.date.minutes - b.date.minutes);

    const fields = [];
    events.forEach((event) => {
        fields.push({
            name: event.date.formattedTime(), value: event.description
        })
    });

    return new MessageEmbed()
        .setColor(color)
        .setTitle(`Events on the ${events[0].date.formattedDate()}`)
        .addFields(fields);
}

const makeHealEmbed = (characterName, color, rollExpression, title, { total, visual }, currentHP, maxHP) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields(
            { name: 'Rolling', value: rollExpression, inline: true },
            { name: 'Total', value: `${visual} = ${total}`, inline: true },
            { name: 'Result', value: `${characterName} heals for ${total} :heart:. (${currentHP}/${maxHP}).` }
        );

const makeHelpEmbed = (color, embedFromDb) =>
    new MessageEmbed(embedFromDb)
        .setColor(color);

//creates an embed for rolling hit dices
const makeHitDiceEmbed = (characterName, color, rollExpression, { total, visual }, hitDicesCount, hitDicesLeft) => {
    const title = `${characterName} spends ${hitDicesCount} hit ${plural('dice', hitDicesCount)}`;

    return new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields(
            { name: 'Rolling', value: rollExpression, inline: true },
            { name: 'Total', value: `${visual} = ${total}`, inline: true },
            { name: 'Result', value: `${characterName} regains ${total} HP :heart:. (${hitDicesLeft} hit ${plural('dice', hitDicesLeft)} left)` }
        );
}

//creates an embed for rolling ability checks or saving throws without adv/dadv
const makeNormalRollEmbed = (characterName, color, rollExpression, title, { total, visual }) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields(
            { name: 'Rolling', value: rollExpression, inline: true },
            { name: 'Total', value: `${visual} = ${total}`, inline: true },
            { name: 'Result', value: `${characterName} rolls ${total}.` }
        );

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

const makeEmptyNoteBlockEmbed = (characterName, color) => {
    return new MessageEmbed()
        .setColor(color)
        .setTitle(`${bold(characterName)}'s notes`)
        .addFields(
            { name: 'Empty note block', value: 'You have 0 notes.' }
        )
}

const makeNoteBlockEmbed = (characterName, color, notes) => {
    const fields = [];
    notes.forEach((note, index) => fields.push({
        name: `Note No. ${index + 1}`, value: note
    }));

    return new MessageEmbed()
        .setColor(color)
        .setTitle(`${bold(characterName)}'s notes`)
        .addFields(fields)
}

const makeObjectEmbed = (color, obj, title) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields(
            makeFields(Object.keys(obj), Object.values(obj))
        );

const joinArmorClassSpecial = (armorClassSpecial) =>
    armorClassSpecial.map(elem => `+${elem.base} against ${elem.damageType}`).join();

const joinProficiencies = (obj) =>
    Object.keys(obj).filter(key => obj[key]).join(' ');

const makeSheetEmbed = (color, sheet) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold('Character sheet'))
        .addFields(
            { name: 'Strength', value: sheet.abilities.Strength, inline: true },
            { name: 'Dexterity', value: sheet.abilities.Dexterity, inline: true },
            { name: 'Constitution', value: sheet.abilities.Constitution, inline: true },
            { name: 'Intelligence', value: sheet.abilities.Intelligence, inline: true },
            { name: 'Wisdom', value: sheet.abilities.Wisdom, inline: true },
            { name: 'Charisma', value: sheet.abilities.Charisma, inline: true },
            { name: 'Class', value: sheet.class, inline: true },
            { name: 'Race', value: sheet.race, inline: true },
            { name: 'Proficiency bonus', value: `+${sheet.proficiencyBonus}` },
            { name: 'Hit dice - type', value: `1d${sheet.hitDice.type}`, inline: true },
            { name: 'Hit dice - count', value: sheet.hitDice.count, inline: true },
            { name: 'Hit dice - spent', value: sheet.hitDice.spent, inline: true },
            { name: 'Current HP', value: sheet.currentHP, inline: true },
            { name: 'Max HP', value: sheet.maxHP, inline: true },
            { name: 'Inspiration', value: boolToYesNo(sheet.inspiration) },
            { name: 'Armor class', value: sheet.armorClass.base, inline: true },
            { name: 'Armor class - special', value: (sheet.armorClass.special.length == 0) ? '-' : joinArmorClassSpecial(sheet.armorClass.special), inline: true },
            { name: 'Initiative', value: sheet.initiative },
            { name: 'Level', value: sheet.level, inline: true },
            { name: 'XP', value: sheet.xp, inline: true },
            { name: 'Saving throws proficiencies', value: `${joinProficiencies(sheet.savingThrows)}` },
            { name: 'Skills proficiencies', value: `${joinProficiencies(sheet.skills)}` },
            { name: 'Speed - walking', value: `${sheet.speed.walking} ft.`, inline: true },
            { name: 'Speed - flying', value: `${sheet.speed.flying} ft.`, inline: true }
        );

const makeSpellEmbed = (color, spell) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(spell.name))
        .addFields(
            { name: 'Casting time', value: spell.casting_time },
            { name: 'Classes', value: spell.classes.join() },
            { name: 'Components', value: spell.components.raw },
            { name: 'Description', value: spell.description },
            { name: 'Duration', value: spell.duration },
            { name: 'Level', value: spell.level },
            { name: 'Range', value: spell.range },
            { name: 'Ritual', value: boolToYesNo(spell.ritual) },
            { name: 'School', value: spell.school },
            { name: 'Type', value: spell.type }
        );

spellSlotsFields = (spellslots) => {
    const fields = [];

    for (let spellSlotLevel in spellslots.total) {
        const total = spellslots.total[spellSlotLevel];
        const expended = spellslots.expended[spellSlotLevel];

        fields.push({
            name: `${Number(spellSlotLevel) + 1}. level`,
            value: `Available ${total - expended} out of ${total}`
        });
    }

    return fields;
}

const makeSpellSlotsEmbed = (color, spellslots) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold('Spell slots'))
        .addFields(spellSlotsFields(spellslots));

const makeTimeEmbed = (color, timeData) => {
    const currentTime = createGameDate(timeData.datetime);
    const lastLongRest = createGameDate(timeData.lastLongRest);

    return new MessageEmbed()
        .setColor(color)
        .setTitle(bold('Date, time and location'))
        .addFields(
            { name: 'Date & time', value: currentTime.formattedDateTime() },
            { name: 'Location', value: timeData.location },
            { name: 'Last long rest', value: lastLongRest.formattedDateTime() }
        );
}

module.exports = {
    makeAdvOrDisadvEmbed,
    makeEmptyNoteBlockEmbed,
    makeEmptyEventDayEmbed,
    makeEventEmbed,
    makeHealEmbed,
    makeHelpEmbed,
    makeHitDiceEmbed,
    makeNormalRollEmbed,
    makeNoteBlockEmbed,
    makeObjectEmbed,
    makeSheetEmbed,
    makeSpellEmbed,
    makeSpellSlotsEmbed,
    makeTimeEmbed
}