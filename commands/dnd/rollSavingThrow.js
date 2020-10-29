const dice = require('../../src/dice.js');
const embed = require('../../src/embed.js');

module.exports = {
    name: 'rst',
    args: true,
    description: 'Roll a saving throw.',
    modifier: (score) => Math.floor((score - 10) / 2),
    calculateAbilityBonus: function (sheet, abilityName) {
        let bonus = this.modifier(sheet['abilities'][abilityName]);

        //check the proficiency
        if (sheet['savingThrows'][abilityName]) {
            bonus += sheet['proficiencyBonus'];
        }

        return bonus;
    },
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
        } else if (args.length == 0 || Object.keys(abilities).indexOf(args[0]) == -1) {
            return await message.reply({
                embed: embed.allAbilityNamesEmbed()
            });
        } else {
            //get character name
            let resultName = await dndDb.collection("players").find({
                discordID: message.author.id
            }).toArray();
            let characterName = resultName[0]["characters"][0];

            //get character sheet
            let resultSheet = await dndDb.collection("characters").find({
                characterName: characterName
            }).toArray();
            let sheet = resultSheet[0];

            const abilityName = args[0];

            //write the title
            let embedTitle = `${abilityName} saving throw`;

            //calculate the bonus
            let bonus = this.calculateAbilityBonus(sheet, abilityName);

            //create a roll expression
            let expr = `1d20${(bonus > 0) ? '+' : '-'}${Math.abs(bonus)}`;
            let expressionDice = new dice.ExpressionDice(expr);
            let rollEmbed = null;

            //a basic roll without adv/dadv and bonus expression
            if (args.length == 1) {
                rollEmbed = embed.normalRollEmbed(characterName, expr, embedTitle, expressionDice.roll());
            }

            //either bonus expression or adv/dadv
            if (args.length == 2) {
                const arguments = args.slice(1).join('');
                if (args[1] == 'adv' || args[1] == 'dadv') {
                    embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                    rollEmbed = embed.advOrDisadvEmbed(characterName, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
                } else if (arguments.startsWith('(') && arguments.endsWith(')')) {
                    const bonusExpr = arguments.substring(1, arguments.length - 1);
                    expr += bonusExpr;
                    expressionDice = new dice.ExpressionDice(expr);
                    rollEmbed = embed.normalRollEmbed(characterName, expr, embedTitle, expressionDice.roll());
                } else {
                    return await message.reply('There is an error with adv/dadv.');
                }
            }

            //a basic roll with adv/dadv and bonus expression
            if (args.length == 3) {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;

                const arguments = args.slice(2).join('');
                const bonusExpr = arguments.substring(1, arguments.length - 1);
                expr += bonusExpr;
                expressionDice = new dice.ExpressionDice(expr);
                rollEmbed = embed.advOrDisadvEmbed(characterName, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
            }

            return await message.reply({
                embed: rollEmbed
            });
        }
    }
}