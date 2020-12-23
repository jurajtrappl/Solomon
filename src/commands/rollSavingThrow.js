const { askedForHelp, printHelpEmbed } = require('../output/help');
const { capitalize } = require('../output/lang');
const { database } = require('../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../output/embed');
const { prepareCheck, addBonusExpression } = require('../rolls/rollUtility');
const { Sheet } = require('../character/sheetUtility');

module.exports = {
    name: 'rst',
    args: true,
    description: 'Roll a saving throw.',
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
        const characterSheet = new Sheet(sheet);

        //write the title
        let embedTitle = `${abilityName} saving throw`;

        const bonus = characterSheet.calculateAbilityBonus(abilityName);
        let check = prepareCheck(bonus);
        
        let rollEmbed = null;

        //pre roll both options
        let normalRoll = check.dice.roll();
        let advDisadvRolls = check.dice.rollWithAdvOrDisadv();

        //a basic roll without adv/dadv and bonus expression
        if (args.length == 1) {
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, normalRoll);
        }

        //either bonus expression or adv/dadv
        if (args.length == 2) {
            const bonusArg = args.slice(1).join('');
            if (args[1] == 'adv' || args[1] == 'dadv') {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, advDisadvRolls.first, advDisadvRolls.second);
            } else if (bonusArg.startsWith('(') && bonusArg.endsWith(')')) {
                check = addBonusExpression(check.expression, bonusArg);
                normalRoll = check.dice.roll();
                rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, normalRoll);
            } else {
                return await message.reply('There is an error with adv/dadv.');
            }
        }

        //a basic roll with adv/dadv and bonus expression
        if (args.length == 3) {
            embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;

            const bonusArg = args.slice(2).join('');
            check = addBonusExpression(check.expression, bonusArg);
            advDisadvRolls = check.dice.rollWithAdvOrDisadv();
            rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, advDisadvRolls.first, advDisadvRolls.second);
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}