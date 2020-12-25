const { database } = require('../../settings.json');
const { ExpressionDice } = require('../rolls/dice');
const { NotFoundError } = require('../err/errors');
const { Sheet } = require('../character/sheet');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'levelUp',
    description: 'Levels up a character.',
    args: true,
    reactionOptions: ['1️⃣', '2️⃣'],
    HP_CHOICE_WAIT_TIME: 10000,
    async execute(message, _args, mongo, _discordClient) {
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

        //get class table
        const classTable = await mongo.tryFind(database.collections.classTables, { class: sheet.class });
        if (!classTable) {
            throw new NotFoundError(searchingObjType.dataFile, `${sheet.class} table`);
        }

        //since the arrays are zero based this is also the index for next level
        const currentLevel = sheet.level;
        if (currentLevel == 20) {
            //already reached max level
        }

        //get next level data
        const nextLevelData = classTable.table[currentLevel];

        //init change embed fields
        const fields = [];

        const embedTitle = `You have reached ${sheet.level + 1}. level`;

        //increase level
        sheet.level += 1;

        //prof bonus
        if (sheet.proficiencyBonus < nextLevelData.proficiencyBonus) {
            fields.push({
                name: 'Proficiency bonus',
                value: `+${sheet.proficiencyBonus} -> +${nextLevelData.proficiencyBonus}`
            });

            sheet.proficiencyBonus = nextLevelData.proficiencyBonus;
        }

        //new features
        const printFeatures = (features) => {
            if (features.length == 1) {
                return [features];
            } else {
                return features.join();
            }
        }

        if (nextLevelData.features.length > 0) {
            fields.push({
                name: 'Features',
                value: `${printFeatures(nextLevelData.features)}`
            });

            sheet.features[currentLevel] = nextLevelData.features;
        }

        //cantrips
        if (sheet.cantrips.known < nextLevelData.cantrips.known) {
            fields.push({
                name: 'Cantrips known',
                value: `${sheet.cantrips.known} -> ${nextLevelData.cantrips.known}`
            });

            sheet.cantrips.known = nextLevelData.cantrips.known;
        }

        //spell slots
        const spellSlotsEqual = (currentSpellSlots, nextLevelSpellSlots) => {
            return currentSpellSlots.length == nextLevelSpellSlots.length &&
                currentSpellSlots.every((spellSlot, level) => spellSlot === nextLevelSpellSlots[level]);
        }

        if (!spellSlotsEqual(sheet.spells.spellslots.total, nextLevelData.spells.spellslots.total)) {
            fields.push({
                name: 'Spell slots',
                value: 'You have gained new spell slots'
            });

            sheet.spells.spellslots.total = nextLevelData.spells.spellslots.total;
        }

        //hit dice count
        fields.push({
            name: 'Hit dices',
            value: `Count increased by 1 from ${sheet.level - 1} to ${sheet.level}`
        });
        sheet.hitDice.count += 1;


        //maxHP changes

        //mongo find druid class features
        let classFeatures = await mongo.tryFind(database.collections.classFeatures, { class: sheet.class });
        if (!classFeatures) {
            throw new NotFoundError(searchingObjType.dataFile, `${sheet.class} class features`);
        }
        classFeatures = classFeatures.classFeatures;

        const characterSheet = new Sheet(sheet);
        const constitutionModifier = Number(characterSheet.modifier(characterSheet.abilityScore('Constitution')));
        const automaticHP = classFeatures.hitPoints.higherLevels.automatic.base + constitutionModifier;
        const rollHPExpression = `1${classFeatures.hitPoints.higherLevels.roll.baseDice}+${constitutionModifier}`;

        const botMessage = await message.reply(`For HP increase by (${automaticHP}) choose 1️⃣, for HP increase by (${rollHPExpression}) choose 2️⃣.`);
        botMessage.react('1️⃣').then(() => botMessage.react('2️⃣'));

        let automaticIncrease = true; /* default */

        await botMessage.awaitReactions((reaction, user) => user.id == message.author.id && this.reactionOptions.includes(reaction.emoji.name), {
            dispose: true,
            time: this.HP_CHOICE_WAIT_TIME
        })
            .then(async collected => {
                const choice = collected.last();

                if (choice.emoji.name != '1️⃣') {
                    automaticIncrease = false;
                }
            })
            .catch(async () => {
                await message.reply('The reaction was not collected. Choosing the default option: increasing by an automatic hp.');
            })

        if (automaticIncrease) {
            fields.push({
                name: 'Max HP',
                value: `Automatic increase: ${sheet.maxHP} -> ${sheet.maxHP + automaticHP}`
            });
            sheet.maxHP += automaticHP;
        } else {
            const expressionDice = new ExpressionDice(rollHPExpression);
            const { visual, totalRoll } = expressionDice.roll();

            fields.push({
                name: 'Max HP',
                value: `Roll HP increase (rolled: ${visual} = ${totalRoll}): ${sheet.maxHP} -> ${sheet.maxHP + Number(totalRoll)}`
            });
            sheet.maxHP += Number(totalRoll);
        }

        return await message.channel.send({
            embed: new MessageEmbed().setColor(message.member.displayHexColor).setTitle(embedTitle).addFields(fields)
        });
    }
};