class Sheet {
    constructor(sheet) {
        this.sheet = sheet;
    }

    abilityScore = (abilityName) => this.sheet.abilities[abilityName];

    skillScore = (skillName) => this.sheet.skills[skillName];

    calculateAbilityBonus = (abilityName) => {
        let bonus = this.modifier(this.sheet.abilities[abilityName]);

        if (this.isSavingThrowProficient(abilityName)) {
            bonus += this.sheet.proficiencyBonus;
        }

        return bonus;
    };

    calculateSkillBonus = (skills, skillName) => {
        const skillAbility = skills[skillName].ability;
        let bonus = this.modifier(this.abilityScore(skillAbility));

        if (this.isSkillProficient(skillName)) {
            bonus += this.sheet.proficiencyBonus;
        }

        if (this.isSkillDoubleProficient(skillName)) {
            bonus += this.sheet.proficiencyBonus;
        }

        return bonus;
    };

    canApplyReliableTalent = (skillName) =>
        this.sheet.class === 'Rogue' &&
        this.sheet.level >= 11 &&
        this.isSkillProficient(skillName);

    isSavingThrowProficient = (abilityName) => this.sheet.savingThrows[abilityName];

    isSkillProficient = (skillName) => this.sheet.skills[skillName].prof;

    isSkillDoubleProficient = (skillName) => this.sheet.doubleProf.includes(skillName);

    modifier = (score) => Math.floor((score - 10) / 2);
}

module.exports = {
    Sheet
};
