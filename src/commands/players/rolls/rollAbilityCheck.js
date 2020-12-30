const { additionalRollFlags, prepareCheck, chooseAdvDadv } = require('../../../rolls/rollUtils');
const { ArgsValidator } = require('../../../err/argsValidator');
const { BadArgError, NotExistingError, NotFoundError, searchingObjType } = require('../../../err/errors');
const { capitalize } = require('../../../output/lang');
const { database } = require('../../../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../../../output/embed');
const { Sheet } = require('../../../character/sheet');

module.exports = {
    name: 'rac',
    args: true,
    description: 'Roll an ability check.',
    flags: {
        advantage: 'adv',
        disadvantage: 'dadv',
        inspiration: 'insp'
    },
    advDadvTitlePart: (flag) => ` with ${(flag == additionalRollFlags.advantage) ? 'an advantage' : 'a disadvantage'}`,
    isInspirationUsed: (flag) => flag === additionalRollFlags.inspiration,
    async execute(message, args, mongo, _discordClient) {
        //get skills
        const skills = await mongo.tryFind(database.collections.data, { name: 'Skills' });
        if (!skills) {
            throw new NotFoundError(searchingObjType.dataFile, 'Skills');
        }

        //check skill name
        ArgsValidator.checkCountAtleast(args, 1);
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

        //pre roll
        const hasReliableTalent = characterSheet.canApplyReliableTalent(skillName);
        let firstRollResult = check.dice.roll({ reliableTalent: hasReliableTalent });
        let secondRollResult = check.dice.roll({ reliableTalent: hasReliableTalent });

        let rollEmbed = null;

        //a basic skill roll without adv/dadv
        if (args.length == 1) {
            ArgsValidator.checkCount(args, 1);
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, firstRollResult);
        }

        //a basil skill roll with adv/dadv
        if (args.length == 2) {
            ArgsValidator.checkCount(args, 2);
            let flag = args[1];

            //check for inspiration
            if (this.isInspirationUsed(flag)) {
                if (!sheet.inspiration) {
                    return await message.reply('You do not any inspiration right now.');
                } else {
                    flag = 'adv';

                    const newInspirationValue = {
                        $set: {
                            'inspiration': false
                        }
                    };

                    await mongo.updateOne(database.collections.characters, { characterName: characterName }, newInspirationValue);
                }
            }

            if (Object.values(additionalRollFlags).includes(flag)) {
                embedTitle += this.advDadvTitlePart(flag);
                const rolls = chooseAdvDadv(flag, [firstRollResult, secondRollResult]);
                rollEmbed = makeAdvOrDisadvEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, rolls);
            } else {
                throw new BadArgError(Object.values(additionalRollFlags).join());
            }
        }

        return await message.reply({
            embed: rollEmbed
        });
    }
}