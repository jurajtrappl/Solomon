const dice = require('../../../src/dice.js');
const settings = require('../../../settings.json');
const { advOrDisadvEmbed, normalRollEmbed } = require('../../../src/embed.js');
const { color } = require('../../colorize.js');

module.exports = {
    name: 'rst',
    args: true,
    description: 'Roll a saving throw.',
    modifier: function (score) { return Math.floor((score - 10) / 2) },
    calculateAbilityBonus: function (sheet, abilityName) {
        let bonus = this.modifier(sheet['abilities'][abilityName]);

        //check the proficiency
        if (sheet['savingThrows'][abilityName]) {
            bonus += sheet['proficiencyBonus'];
        }

        return bonus;
    },
    async execute(message, args, db, _client) {
        if (args[0] === 'help') {
            dndDb.collection(settings.database.collections.helpEmbeds).find({
                commandName: this.name
            }).toArray(async (err, result) => {
                if (err) throw err;
                return await message.reply({
                    embed: result[0],
                });
            });
        } else {
            //get character name
            let resultName = await db.collection(settings.database.collections.players).find({
                discordID: message.author.id
            }).toArray();
            let characterName = resultName[0]["characters"][0];

            //get character sheet
            let resultSheet = await db.collection(settings.database.collections.characters).find({
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

            const color = color(message.author.id, db);

            //a basic roll without adv/dadv and bonus expression
            if (args.length == 1) {
                rollEmbed = normalRollEmbed(characterName, color, expr, embedTitle, expressionDice.roll());
            }

            //either bonus expression or adv/dadv
            if (args.length == 2) {
                const arguments = args.slice(1).join('');
                if (args[1] == 'adv' || args[1] == 'dadv') {
                    embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                    rollEmbed = advOrDisadvEmbed(characterName, color, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
                } else if (arguments.startsWith('(') && arguments.endsWith(')')) {
                    const bonusExpr = arguments.substring(1, arguments.length - 1);
                    expr += bonusExpr;
                    expressionDice = new dice.ExpressionDice(expr);
                    rollEmbed = normalRollEmbed(characterName, color, expr, embedTitle, expressionDice.roll());
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
                rollEmbed = advOrDisadvEmbed(characterName, color, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
            }

            return await message.reply({
                embed: rollEmbed
            });
        }
    }
}