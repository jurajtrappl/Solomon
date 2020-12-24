const { MessageEmbed } = require('discord.js');

//creates an embed for rolling ability checks or saving throws using adv/dadv
function makeAdvOrDisadvEmbed(characterName, color, flag, expr, title, first, second) {
    return new MessageEmbed()
        .setColor(color)
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

function makeHealEmbed(characterName, color, expr, title, { visual, totalRoll }, currentHP, maxHP) {
    return new MessageEmbed()
        .setColor(color)
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

function makeHelpEmbed(color, embedFromDb) {
    return new MessageEmbed(embedFromDb)
        .setColor(color);
}

//creates an embed for rolling hit dices
function makeHitDiceEmbed(characterName, color, expression, { visual, totalRoll }, hitDicesCount, hitDicesLeft) {
    return new MessageEmbed()
        .setColor(color)
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

//creates an embed for rolling ability checks or saving throws without adv/dadv
function makeNormalRollEmbed(characterName, color, expr, title, { visual, totalRoll }) {
    return new MessageEmbed()
        .setColor(color)
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

function makeFields(names, values) {
    const fields = [];
    for (let i = 0; i < names.length; i++) {
        fields.push({
            name: names[i],
            value: values[i]
        });
    }
    return fields;
}

function makeObjectEmbed(color, obj, title) {
    return new MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .addFields(
            makeFields(Object.keys(obj), Object.values(obj))
        );
}

function printSavingThrowProficiencies(obj) {
    let proficiencies = '';
    for (let key in obj) {
        if (obj[key]) proficiencies += `${key} `;
    }
    return proficiencies;
}

function printSkillProficiencies(obj) {
    let proficiencies = '';
    for (let skill in obj) {
        if (obj[skill].prof) proficiencies += `${skill} `;
    }
    return proficiencies;
}

function makeSheetEmbed(color, sheet) {
    return new MessageEmbed()
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
            value: `${printSavingThrowProficiencies(sheet.savingThrows)}`
        }, {
            name: 'Skills proficiencies',
            value: `${printSkillProficiencies(sheet.skills)}`
        }, {
            name: 'Speed',
            value: sheet.speed
        }, {
            name: 'XP',
            value: sheet.xp
        });
}

function spellSlotsFields(spellslots) {
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

function makeSpellSlotsEmbed(color, spellslots) {
    return new MessageEmbed()
        .setColor(color)
        .setTitle('Spell slots')
        .addFields(spellSlotsFields(spellslots));
}

function makeTimeEmbed(color, time) {
    return new MessageEmbed()
        .setColor(color)
        .setTitle('Date, time and location')
        .addFields({
            name: 'Date & time:',
            value: time.datetime.toLocaleString(),
        }, {
            name: 'Location',
            value: time.location,
        }, {
            name: 'Last long rest',
            value: time.lastLongRest.toLocaleString()
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