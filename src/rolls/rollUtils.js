const { DiceRoller } = require("./diceRoller");

const createCheckExpression = (bonus) => `1d20${(bonus > 0) ? '+' : '-'}${Math.abs(bonus)}`

const prepareCheck = (bonus) => {
    const expression = createCheckExpression(bonus);
    
    return {
        dice: new DiceRoller(expression),
        expression: expression
    }
}

const createHitDiceCheckExpression = (hitDiceCountToSpend, hitDiceType, constitutionModifier) =>
    `${hitDiceCountToSpend}d${hitDiceType}+${hitDiceCountToSpend * constitutionModifier}`;

const prepareHitDiceCheck = (hitDiceCountToSpend, hitDiceType, constitutionModifier) => {
    const expression = createHitDiceCheckExpression(hitDiceCountToSpend, hitDiceType, constitutionModifier);

    return {
        dice: new DiceRoller(expression),
        expression: expression
    }
}

module.exports = {
    prepareCheck,
    prepareHitDiceCheck
}