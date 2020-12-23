const { ExpressionDice } = require("./dice");

const createCheckExpression = (bonus) => `1d20${(bonus > 0) ? '+' : '-'}${Math.abs(bonus)}`

const prepareCheck = (bonus) => {
    const expression = createCheckExpression(bonus);
    
    return {
        dice: new ExpressionDice(expression),
        expression: expression
    }
}

const addBonusExpression = (currentExpr, args) => {
    const bonusExpression = args.substring(1, args.length - 1);
    const newExpression = currentExpr + bonusExpression;

    return {
        dice: new ExpressionDice(newExpression),
        expression: newExpression
    }
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
    addBonusExpression,
    prepareCheck,
    reliableTalent,
}