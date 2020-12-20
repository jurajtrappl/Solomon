/**
 * Abstract class Dice
 * 
 * @class Dice
 */
class Dice {
    constructor(count, type, bonus) {
        this.count = count;
        this.type = type;
        this.bonus = bonus;

        if (this.constructor == Dice) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    roll() {
        throw new Error("Method 'roll()' must be implemented.");
    }

    createVisual(rolls) {
        let visual = `(${rolls[0]}`;
        for (let i = 1; i < rolls.length; i++) {
            visual += `${(rolls[i] >= 0) ? ' +' : ' -'} ${Math.abs(rolls[i])}`;
        }
        visual += ')';
        return visual;
    }

    getRandomInteger = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

/**
 * SimpleDice.
 * 
 * @class SimpleDice
 * @extends {Dice}
 */
class SimpleDice extends Dice {
    constructor(count, type, bonus) {
        super(count, type, bonus);
    }

    roll() {
        const rolls = [];
        for (let i = 0; i < this.count; i++) {
            rolls.push(this.getRandomInteger(1, this.type));
        }

        if (this.bonus) {
            rolls.push(this.bonus);
        }

        return {
            total: rolls.reduce((a, b) => a + b, 0),
            visual: this.createVisual(rolls)
        }
    }
}

const rollBonusRegex = /^[+|-][0-9]+$/;
const rollDiceRegex = /^[+|-]?[0-9]+d(4|6|8|10|12|20)$/;

function isDiceOrBonus(arg) {
    return arg.match(rollDiceRegex) || arg.match(rollBonusRegex);
}

function parseRollExpression(expr) {
    let lastPos = expr.length;
    const parts = [];
    for (let i = expr.length - 1; i >= 0; i--) {
        if (expr.charAt(i) == '+' || expr.charAt(i) == '-') {
            parts.push(`${expr.slice(i, lastPos)}`);
            lastPos = i;
        }
    }

    //push the last part
    if (lastPos != 0) {
        parts.push(`${expr.slice(0, lastPos).trim()}`);
    }

    return parts.filter(p => p != '-' && p != '+').reverse();
}

function isRollExpression(value) {
    const parts = parseRollExpression(value);
    return parts.every(isDiceOrBonus);
}

/**
 * ExpressionDice.
 * 
 * @class ExpressionDice
 */
class ExpressionDice {
    constructor(expr) {
        if (!isRollExpression(expr)) {
            throw new Error('Error in the expression.');
        }

        this.parts = parseRollExpression(expr);
    }

    parseDice = (value) => {
        const splitted = value.split('d');
        return new SimpleDice(Math.abs(splitted[0]) || 1, Math.abs(splitted[1]) || 20);
    }

    //calculate the expression
    roll() {
        let total = 0,
            visual = [];
        this.parts.forEach(arg => {
            if (arg.match(rollDiceRegex)) {
                const d = this.parseDice(arg);
                const {
                    total: diceTotal,
                    visual: diceVisual
                } = d.roll();

                if (arg[0] == '+' || Number(arg[0])) {
                    total += diceTotal;
                    visual.push(` + ${diceVisual}`);
                } else {
                    total -= diceTotal;
                    visual.push(` - ${diceVisual}`);
                }
            } else {
                total += Number(arg);

                if (Number(arg) < 0) {
                    visual.push(` - ${Math.abs(arg)}`);
                } else {
                    visual.push(` + ${Math.abs(arg)}`);
                }
            }
        });

        return {
            visual: `${visual.join(' ').substring(2)}`,
            totalRoll: total
        }
    }

    rollWithAdvOrDisadv = () => {
        return {
            first: this.roll(),
            second: this.roll()
        }
    };
}

module.exports = {
    ExpressionDice,
    SimpleDice,
    isRollExpression
}