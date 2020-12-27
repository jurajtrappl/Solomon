const { parse } = require('./expression/parser');
const { evaluate, postfixToInfix } = require('./expression/evaluate');

class DiceRoller {
    constructor(expression) {
        this.expression = expression;
    }

    roll = (rollOptions = null) => {
        const totalRollStack = [];
        const visualRollStack = [];
        parse(this.expression).forEach(token => evaluate(token, totalRollStack, visualRollStack, rollOptions));
        
        return {
            total: totalRollStack,
            visual: postfixToInfix(visualRollStack)
        }
    }    
}

module.exports = {
    DiceRoller
}