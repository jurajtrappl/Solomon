const modifier = (score) => Math.floor((score - 10) / 2);

const calculateAbilityBonus = (sheet, abilityName) => {
    let bonus = modifier(sheet.abilities[abilityName]);

    //check the proficiency
    if (sheet.savingThrows[abilityName]) {
        bonus += sheet.proficiencyBonus;
    }

    return bonus;
}

const calculateSkillBonus = (sheet, skillName, skills) => {
    const skillAbility = skills[skillName].ability;
    let bonus = modifier(sheet.abilities[skillAbility]);

    //check for proficiency
    if (sheet.skills[skillName].prof) {
        bonus += sheet.proficiencyBonus;
    }

    //check for double proficiency
    if (sheet.doubleProf.indexOf(skillName) != -1) {
        bonus += sheet.proficiencyBonus;
    }

    return bonus;
}

const reliableTalent = ({ visual, totalRoll }) => {
    let splitted = visual.split('+');
    let diceRoll = splitted[0].trim().substring(1, splitted[0].trim().length - 1);

    let newVisual = visual;
    let newTotal = totalRoll;
    if (diceRoll < 10) {
        newVisual = `(10) + ${splitted[1]}`;
        newTotal += 10 - diceRoll;
    }

    return {
        visual: newVisual,
        totalRoll: newTotal
    }
}

module.exports = {
    calculateAbilityBonus,
    calculateSkillBonus,
    modifier,
    reliableTalent,
}