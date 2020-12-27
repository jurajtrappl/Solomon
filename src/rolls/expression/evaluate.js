const { Dice } = require('../dice');

const operator = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b
};

const bonusRegex = /^[0-9]+$/;
const diceRegex = /^[0-9]+d(4|6|8|10|12|20)$/;

const evaluate = (token, totalRollStack, visualRollStack, rollOptions) => {
    if (Object.keys(operator).includes(token)) {
        const b = + totalRollStack.pop();
        const a = + totalRollStack.pop();
        totalRollStack.push(operator[token](a, b));
        visualRollStack.push(token);
    } else if (token.match(bonusRegex)) {
        totalRollStack.push(Number(token));
        visualRollStack.push(token);
    } else if (token.match(diceRegex)) {
        const dice = new Dice(token);
        if (rollOptions) {
            if (rollOptions.reliableTalent) {
                const { total, visual } = dice.rollReliableTalent();
                totalRollStack.push(total);
                visualRollStack.push(visual);
            } else {
                const { total, visual } = dice.roll();
                totalRollStack.push(total);
                visualRollStack.push(visual);
            }
        } else {
            const { total, visual } = dice.roll();
            totalRollStack.push(total);
            visualRollStack.push(visual);
        }
    } else {
        throw new Error('Evaluate error.');
    }
};

const postfixToInfix = (postfixStack) => {
    const stack = [];

    for (let i = 0; i < postfixStack.length; i++) {
        if (Object.keys(operator).includes(postfixStack[i])) {
            const b = stack.pop();
            const a = stack.pop();
            stack.push(`${a} ${postfixStack[i]} ${b}`);
        } else {
            stack.push(postfixStack[i]);
        }
    }

    return stack.pop();
}

module.exports = {
    evaluate,
    postfixToInfix
}