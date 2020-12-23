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
    reliableTalent,
}