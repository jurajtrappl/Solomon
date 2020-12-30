const { additionalRollFlags, prepareCheck, chooseAdvDadv } = require('../../../rolls/rollUtils');
const { BadArgError, NotExistingError, NotFoundError, searchingObjType } = require('../../../err/errors');
const { capitalize } = require('../../../output/lang');
const { database } = require('../../../../settings.json');
const { makeAdvOrDisadvEmbed, makeNormalRollEmbed } = require('../../../output/embed');
const { Sheet } = require('../../../character/sheet');

module.exports = {
    name: 'rst',
    description: 'Roll a saving throw.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'ability' }],
            [{ type: 'ability' }, { type: 'rollFlag' }]
        ]
    },
    advDadvTitlePart: (flag) => ` with ${(flag == additionalRollFlags.advantage) ? 'an advantage' : 'a disadvantage'}`,
    isInspirationUsed: (flag) => flag === additionalRollFlags.inspiration,
    async execute(message, [ abilityName, ...maybeRollFlag ], mongo, _discordClient) {
        //get abilities
        const abilities = await mongo.tryFind(database.collections.data, { name: 'Abilities' });
        if (!abilities) {
            throw new NotFoundError(searchingObjType.dataFile, 'Abilities');
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
        abilityName = capitalize(abilityName);
        let embedTitle = `${abilityName} saving throw`;

        const bonus = characterSheet.calculateAbilityBonus(abilityName);
        let check = prepareCheck(bonus);

        let rollEmbed = null;

        //a basic roll without adv/dadv and bonus expression
        if (!maybeRollFlag.length) {
            rollEmbed = makeNormalRollEmbed(characterName, message.member.displayHexColor, check.expression, embedTitle, check.dice.roll());
        }

        //either bonus expression or adv/dadv
        if (maybeRollFlag.length) {
            let flag = maybeRollFlag[0];

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