const dice = require('../../../src/dice.js');
const settings = require('../../../settings.json');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
    async execute(message, args, db) {
        if (args[0] === 'help') {
            db.collection(settings.database.collections.helpEmbeds).find({
                commandName: this.name
            }).toArray(async (err, result) => {
                if (err) throw err;
                return await message.reply({
                    embed: result[0],
                });
            });
        } else {
            const expressionDice = new dice.ExpressionDice(args.map(a => a.trim()).join(''));
            return await message.reply(expressionDice.roll());
        }
    }
}