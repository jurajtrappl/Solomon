const { additionalRollFlags, prepareCheck, chooseAdvDadv } = require('../../../rolls/rollUtils');
const { ArgsValidator } = require('../../../err/argsValidator');
const { BadArgError, NotExistingError, NotFoundError, searchingObjType } = require('../../../err/errors');
const { capitalize } = require('../../../output/lang');
const { database } = require('../../../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../../../output/embed');
const { Sheet } = require('../../../character/sheet');

module.exports = {
    name: 'rst',
    args: true,
    description: 'Roll a saving throw.',
    advDadvTitlePart: (flag) => ` with ${(flag == additionalRollFlags.advantage) ? 'an advantage' : 'a disadvantage'}`,
    isInspirationUsed: (flag) => flag === additionalRollFlags.inspiration,
    async execute(message, args, mongo, _discordClient) {
        //get abilities
        const abilities = await mongo.tryFind(database.collections.data, { name: 'Abilities' });
        if (!abilities) {
            throw new NotFoundError(searchingObjType.dataFile, 'Abilities');
        }

        ArgsValidator.checkCountAtleast(args, 1);
        const abilityName = capitalize(args[0]);
        if (!Object.keys(abilities.content).includes(abilityName)) {
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
        let embedTitle = `${abilityName} saving throw`;

        const bonus = characterSheet.calculateAbilityBonus(abilityName);
        let check = prepareCheck(bonus);
        
        let rollEmbed = null;

        //a basic roll without adv/dadv and bonus expression
        if (args.length == 1) {
            ArgsValidator.checkCount(args, 1);
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, check.dice.roll());
        }

        //either bonus expression or adv/dadv
        if (args.length == 2) {
            ArgsValidator.checkCount(args, 2);
            let flag = args[1];

            if (this.isInspirationUsed(flag)) {
                if (!sheet.inspiration) {
                    return await message.reply('You do not any inspiration right now.');
                } else {
                    args[1] = 'adv';

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
                const rolls = chooseAdvDadv(flag, [check.dice.roll(), check.dice.roll()]);
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