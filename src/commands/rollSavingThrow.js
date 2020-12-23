const { askedForHelp, printHelpEmbed } = require('../help');
const { capitalize } = require('../lang');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../dice');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../embed');

module.exports = {
    name: 'rst',
    args: true,
    description: 'Roll a saving throw.',
    modifier: function (score) { return Math.floor((score - 10) / 2) },
    calculateAbilityBonus: function (sheet, abilityName) {
        let bonus = this.modifier(sheet.abilities[abilityName]);

        //check the proficiency
        if (sheet.savingThrows[abilityName]) {
            bonus += sheet.proficiencyBonus;
        }

        return bonus;
    },
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get abilities
        const abilities = await mongo.tryFind(database.collections.data, { name: 'Abilities' });
        if (!abilities) {
            throw new Error(`There are not data about abilities.`);
        }

        const abilityName = capitalize(args[0]);
        if (!Object.keys(abilities.content).includes(abilityName)) {
            return await message.reply(`${args[0]} does not exist.`);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new Error(`You do not have a character.`);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new Error(`${characterName} has not a character sheet`);
        }

        //write the title
        let embedTitle = `${abilityName} saving throw`;

        //calculate the bonus
        let bonus = this.calculateAbilityBonus(sheet, abilityName);

        //create a roll expression
        let expr = `1d20${(bonus > 0) ? '+' : '-'}${Math.abs(bonus)}`;
        let expressionDice = new ExpressionDice(expr);
        let rollEmbed = null;

        //a basic roll without adv/dadv and bonus expression
        if (args.length == 1) {
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, expr, embedTitle, expressionDice.roll());
        }

        //either bonus expression or adv/dadv
        if (args.length == 2) {
            const arguments = args.slice(1).join('');
            if (args[1] == 'adv' || args[1] == 'dadv') {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
            } else if (arguments.startsWith('(') && arguments.endsWith(')')) {
                const bonusExpr = arguments.substring(1, arguments.length - 1);
                expr += bonusExpr;
                expressionDice = new ExpressionDice(expr);
                rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, expr, embedTitle, expressionDice.roll());
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
            expressionDice = new ExpressionDice(expr);
            rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], expr, embedTitle, expressionDice.rollWithAdvOrDisadv());
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}