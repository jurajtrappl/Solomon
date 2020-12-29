const { capitalize } = require('../../../output/lang');
const { database } = require('../../../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../../../output/embed');
const { NotExistingError, NotFoundError, searchingObjType } = require('../../../err/errors');
const { prepareCheck } = require('../../../rolls/rollUtils');
const { Sheet } = require('../../../character/sheet');

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

        //pre roll
        const hasReliableTalent = characterSheet.canApplyReliableTalent(skillName);
        let firstRollResult = check.dice.roll({ reliableTalent: hasReliableTalent });
        let secondRollResult = check.dice.roll({ reliableTalent: hasReliableTalent });

        //a basic skill roll without adv/dadv
        if (args.length == 1) {
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, firstRollResult);
        }

        //a basil skill roll with adv/dadv
        if (args.length == 2) {
            if (args[1] == 'adv' || args[1] == 'dadv') {
                embedTitle += ` with ${(args[1] == 'adv') ? 'an advantage' : 'a disadvantage'}`;
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, args[1], check.expression, embedTitle, firstRollResult, secondRollResult);
            } else {
                return await message.reply('There is an error with adv/dadv.');
            }
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}