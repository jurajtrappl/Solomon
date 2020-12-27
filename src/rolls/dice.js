const { getRandomInteger } = require('../utils/random');

/**
 * @class Dice
 */
class Dice {
    constructor(diceExpression) {
        const splitted = diceExpression.split('d');
        
        this.count = Number(splitted[0]);
        this.type = Number(splitted[1]);
    }

    roll = () => { 
        const rolls = [];
        for (let i = 0; i < this.count; i++) {
            rolls.push(getRandomInteger(1, this.type));
        }

        return {
            total: rolls.reduce((a, b) => a + b, 0),
            visual: `(${rolls.join(' + ')})`
        }
    }

    rollReliableTalent = () => {
        const rollResult = this.roll();
    
        return {
            total: Number(rollResult.total) < 10 ? 10 : rollResult.total,
            visual: Number(rollResult.total) < 10 ? '(10)' : rollResult.visual
        }
    }
}

module.exports = {
    Dice
}