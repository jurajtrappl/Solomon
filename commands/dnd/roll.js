const dice = require('../../src/dice.js');

module.exports = {
    name: 'roll',
    args: true,
    description: 'Rolling dices for D&D.',
    async execute(message, args, dbClient) {
        await dbClient.connect();
        const dndDb = dbClient.db("dnd");

        if (args[0] === 'help') {
            dndDb.collection("helpEmbeds").find({
                commandName: this.name
            }).toArray(async (err, result) => {
                if (err) throw err;
                return await message.reply({
                    embed: result[0],
                });
            });
        }
        else {
            const expressionDice = new dice.ExpressionDice(args.map(a => a.trim()).join(''));
            return await message.reply(expressionDice.roll());
        }
    }
}