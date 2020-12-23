class Sheet {
    constructor(sheet) {
        this.sheet = sheet;
    }

    abilityScore = (abilityName) => { console.log(this.sheet.abilities[abilityName]) }; 
    skillScore = (skillName) => this.sheet.skills[skillName];

    calculateAbilityBonus = (abilityName) => {
        let bonus = this.modifier(this.sheet.abilities[abilityName]);
    
        //check the proficiency
        if (this.sheet.savingThrows[abilityName]) {
            bonus += this.sheet.proficiencyBonus;
        }
    
        return bonus;
    }

    calculateSkillBonus = (skills, skillName) => {
        const skillAbility = skills[skillName].ability;
        let bonus = this.modifier(this.abilityScore(skillAbility));
        
        //check for proficiency
        if (this.sheet.skills[skillName].prof) {
            bonus += this.sheet.proficiencyBonus;
        }
    
        //check for double proficiency
        if (this.sheet.doubleProf.indexOf(skillName) != -1) {
            bonus += this.sheet.proficiencyBonus;
        }
    
        return bonus;
    }

    modifier = (score) => Math.floor((score - 10) / 2);
}

module.exports = { Sheet }