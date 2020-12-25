const { addBonusExpression, prepareCheck, reliableTalent } = require('../rolls/rollUtils');
const { capitalize } = require('../output/lang');
const { database } = require('../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../output/embed');
const { NotFoundError, searchingObjType, NotExistingError } = require('../err/errors');
const { Sheet } = require('../character/sheet');

module.exports = {
    name: 'rac',
    args: true,
    description: 'Roll an ability check.',
    async execute(message, args, mongo, _discordClient) {
        //get skills
        const skills = await mongo.tryFind(database.collections.data, { name: 'Skills' });
        if (!skills) {
            throw new NotFoundError(searchingObjType.dataFile, 'Skills');
        }

        //check skill name
        const skillName = capitalize(args[0]);
        if (!Object.keys(skills.content).includes(skillName)) {
            throw new NotExistingError(args[0]);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }
        const characterSheet = new Sheet(sheet);

        //write the title
        let embedTitle = `${skills.content[skillName].name} ability check`;;

        const bonus = characterSheet.calculateSkillBonus(skills.content, skillName);
        let check = prepareCheck(bonus);

        let rollEmbed = null;

        //a basic roll without adv/dadv and bonus expression
        if (args.length == 1) {
            let firstRoll = check.dice.roll();
            if (characterSheet.canApplyReliableTalent(skillName)) {
                firstRoll = reliableTalent(firstRoll);
            }

            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, firstRoll);
        }

        //either bonus expression or adv/dadv
        if (args.length == 2) {
            const bonusArg = args.slice(1).join('');

            let firstRoll = check.dice.roll();
            let secondRoll = check.dice.roll();

            if (characterSheet.canApplyReliableTalent(skillName)) {
                firstRoll = reliableTalent(firstRoll);
                secondRoll = reliableTalent(secondRoll);
            }

            if (args[1] == 'adv' || args[1] == 'dadv') {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, firstRoll, secondRoll);
            } else if (bonusArg.startsWith('(') && bonusArg.endsWith(')')) {
                check = addBonusExpression(check.expression, bonusArg);

                if (characterSheet.canApplyReliableTalent(skillName)) {
                    firstRoll = reliableTalent(firstRoll);
                }
                
                rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, firstRoll);
            } else {
                return await message.reply('There is an error with adv/dadv.');
            }
        }

        //a basic roll with adv/dadv and bonus expression
        if (args.length == 3) {
            embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;

            const bonusArg = args.slice(2).join('');
            check = addBonusExpression(check.expression, bonusArg);

            let firstRoll = check.dice.roll();
            let secondRoll = check.dice.roll();

            if (characterSheet.canApplyReliableTalent(skillName)) {
                firstRoll = reliableTalent(firstRoll);
                secondRoll = reliableTalent(secondRoll);
            }

            rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, firstRoll, secondRoll);
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}