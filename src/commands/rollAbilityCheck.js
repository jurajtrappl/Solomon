const { askedForHelp, printHelpEmbed } = require('../output/help');
const { capitalize } = require('../output/lang');
const { database } = require('../../settings.json');
const { ExpressionDice } = require('../rolls/dice');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../output/embed');
const { reliableTalent } = require('../rolls/rollUtility');
const { Sheet } = require('../character/sheetUtility');

module.exports = {
    name: 'rac',
    args: true,
    description: 'Roll an ability check.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get skills
        const skills = await mongo.tryFind(database.collections.data, { name: 'Skills' });
        if (!skills) {
            throw new Error(`There are not data about skills.`);
        }

        //check skill name
        const skillName = capitalize(args[0]);
        if (!Object.keys(skills.content).includes(skillName)) {
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
        const characterSheet = new Sheet(sheet);

        //write the title
        let embedTitle = `${skills.content[skillName].name} ability check`;;

        //calculate the bonus
        let bonus = characterSheet.calculateSkillBonus(skills.content, skillName);

        //create a roll expression
        let expr = `1d20${(bonus > 0) ? '+' : '-'}${Math.abs(bonus)}`;
        let expressionDice = new ExpressionDice(expr);
        let rollEmbed = null;

        //pre roll both options
        let normalRoll = expressionDice.roll();
        let { first, second } = expressionDice.rollWithAdvOrDisadv();

        if (characterSheet.canApplyReliableTalent(skillName)) {
            normalRoll = reliableTalent(expressionDice.roll());
            first = reliableTalent(first);
            second = reliableTalent(second);
        }

        //a basic roll without adv/dadv and bonus expression
        if (args.length == 1) {
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, expr, embedTitle, normalRoll);
        }

        //either bonus expression or adv/dadv
        if (args.length == 2) {
            const arguments = args.slice(1).join('');
            if (args[1] == 'adv' || args[1] == 'dadv') {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], expr, embedTitle, first, second);
            } else if (arguments.startsWith('(') && arguments.endsWith(')')) {
                const bonusExpr = arguments.substring(1, arguments.length - 1);
                expr += bonusExpr;
                expressionDice = new ExpressionDice(expr);
                rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, expr, embedTitle, normalRoll);
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
            rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], expr, embedTitle, first, second);
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}