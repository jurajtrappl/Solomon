const { bold } = require('./discordMarkdown');
const { boolToYesNo, plural } = require('./lang');
const { GameCalendar } = require('../calendar/gameCalendar');
const { MessageEmbed } = require('discord.js');

//creates an embed for rolling ability checks or saving throws using adv/dadv
makeAdvOrDisadvEmbed = (characterName, color, rollExpression, title, [first, second]) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields({
            name: 'Rolling',
            value: rollExpression
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
            value: `${characterName} rolls ${first.total}.`
        });

makeHealEmbed = (characterName, color, expr, title, { total, visual }, currentHP, maxHP) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
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
makeHitDiceEmbed = (characterName, color, expression, { total, visual }, hitDicesCount, hitDicesLeft) => {
    const title = `${characterName} spends ${hitDicesCount} hit ${plural('dice', hitDicesCount)}`;

    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
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
}

//creates an embed for rolling ability checks or saving throws without adv/dadv
makeNormalRollEmbed = (characterName, color, rollExpression, title, { total, visual }) =>
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

makeObjectEmbed = (color, obj, title) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold(title))
        .addFields(
            makeFields(Object.keys(obj), Object.values(obj))
        );

const joinArmorClassSpecial = (armorClass) =>
    armorClass.special.map(elem => `+${elem.base} against ${elem.damageType}`).join();

const joinProficiencies = (obj) =>
    Object.keys(obj).filter(key => obj[key]).join(' ');

makeSheetEmbed = (color, sheet) =>
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
            {
                name: 'Inspiration',
                value: boolToYesNo(sheet.inspiration)
            },
            { name: 'Armor class', value: sheet.armorClass.base, inline: true },
            { name: 'Armor class - special', value: joinArmorClassSpecial(sheet.armorClass), inline: true },
            {
                name: 'Initiative',
                value: sheet.initiative
            },
            { name: 'Level', value: sheet.level, inline: true },
            { name: 'XP', value: sheet.xp, inline: true },
            { name: 'Saving throws proficiencies', value: `${joinProficiencies(sheet.savingThrows)}` },
            { name: 'Skills proficiencies', value: `${joinProficiencies(sheet.skills)}` },
            { name: 'Speed - walking', value: `${sheet.speed.walking} ft.`, inline: true },
            { name: 'Speed - flying', value: `${sheet.speed.flying} ft.`, inline: true }
        );

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

makeSpellEmbed = (color, spell) =>
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

makeSpellSlotsEmbed = (color, spellslots) =>
    new MessageEmbed()
        .setColor(color)
        .setTitle(bold('Spell slots'))
        .addFields(spellSlotsFields(spellslots));

makeTimeEmbed = (color, timeData) => {
    const currentTime = new GameCalendar(timeData.datetime);
    const lastLongRest = new GameCalendar(timeData.lastLongRest);

    return new MessageEmbed()
        .setColor(color)
        .setTitle(bold('Date, time and location'))
        .addFields(
            { name: 'Date & time', value: currentTime.getFormattedDateTime() },
            { name: 'Location', value: timeData.location },
            { name: 'Last long rest', value: lastLongRest.getFormattedDateTime() }
        );
}

module.exports = {
    makeAdvOrDisadvEmbed,
    makeHealEmbed,
    makeHelpEmbed,
    makeHitDiceEmbed,
    makeNormalRollEmbed,
    makeObjectEmbed,
    makeSheetEmbed,
    makeSpellEmbed,
    makeSpellSlotsEmbed,
    makeTimeEmbed
}