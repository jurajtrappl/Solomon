const { capitalize } = require('../output/lang');
const { database } = require('../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../output/embed');
const { NotExistingError, NotFoundError, searchingObjType } = require('../err/errors');
const { prepareCheck, addBonusExpression } = require('../rolls/rollUtils');
const { Sheet } = require('../character/sheet');

module.exports = {
    name: 'rst',
    args: true,
    description: 'Roll a saving throw.',
    async execute(message, args, mongo, _discordClient) {
        //get abilities
        const abilities = await mongo.tryFind(database.collections.data, { name: 'Abilities' });
        if (!abilities) {
            throw new NotFoundError(searchingObjType.dataFile, 'Abilities');
        }

        const abilityName = capitalize(args[0]);
        if (!Object.keys(abilities.content).includes(abilityName)) {
            throw new NotExistingError(args[0]);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }
        const characterSheet = new Sheet(sheet);

        //write the title
        let embedTitle = `${abilityName} saving throw`;

        const bonus = characterSheet.calculateAbilityBonus(abilityName);
        let check = prepareCheck(bonus);
        
        let rollEmbed = null;

        //a basic roll without adv/dadv and bonus expression
        if (args.length == 1) {
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, check.dice.roll());
        }

        //either bonus expression or adv/dadv
        if (args.length == 2) {
            const bonusArg = args.slice(1).join('');
            if (args[1] == 'adv' || args[1] == 'dadv') {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, check.dice.roll(), check.dice.roll());
            } else if (bonusArg.startsWith('(') && bonusArg.endsWith(')')) {
                check = addBonusExpression(check.expression, bonusArg);
                rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, check.dice.roll());
            } else {
                return await message.reply('There is an error with adv/dadv.');
            }
        }

        //a basic roll with adv/dadv and bonus expression
        if (args.length == 3) {
            embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;

            const bonusArg = args.slice(2).join('');
            check = addBonusExpression(check.expression, bonusArg);
            
            rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, check.dice.roll(), check.dice.roll());
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}