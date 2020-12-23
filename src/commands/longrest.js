const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');

module.exports = {
    name: 'longrest',
    args: false,
    description: 'Performs a long rest.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new Error(`You do not have a character.`);
        }
        const [characterName] = playerData.characters;

        //get character time data, to check if long rest is available
        const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
        if (!time) {
            throw new Error(`${characterName} does not have time data.`);
        }

        //get longrest length
        const longRestLength = await mongo.tryFind(database.collections.data, { name: 'LongRestLength' });
        if (!longRestLength) {
            throw new Error(`There are not data about length of longrests of races.`);
        }

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new Error(`${characterName} has not a character sheet.`);
        }

        const lastLongRest = new Date(time.lastLongRest);
        const currentTime = new Date(time.dateTime);

        let isContinue = true;

        const isAtleastOneDayAfterLastLongRest = Math.abs(currentTime - lastLongRest) / 36e5 >= (24 - longRestLength.content[sheet.race]);
        if (!isAtleastOneDayAfterLastLongRest) {
            let benefitableTime = new Date(lastLongRest);
            benefitableTime.setHours(benefitableTime.getHours() + (24 - longRestLength.content[sheet.race]));
            await message.reply(`You can not benefit from long rest until ${benefitableTime.toLocaleString()}. Do you still wish to do a long rest?`);

            message.react('👍').then(() => message.react('👎'));
            await message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'), {
                max: 1,
                time: 15000,
                errors: ['time']
            })
                .then(async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name == '👎') {
                        isContinue = false;
                    }
                })
                .catch(async () => {
                    isContinue = false;
                    await message.reply('You are not speed.');
                })
        }

        if (!isContinue) {
            return await message.reply('Okay, ain\'t nobody got time for that.');
        }

        let isEnoughHP = sheet.currentHP >= 1;
        if (!isEnoughHP) {
            await message.reply('You can not benefit from long rest, because you have less than 1 HP. Do you still wish to do a long rest?');

            message.react('👍').then(() => message.react('👎'));
            await message.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍' || reaction.emoji.name == '👎'), {
                max: 1,
                time: 15000,
                errors: ['time']
            })
                .then(async collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name == '👎') {
                        isContinue = false;
                    }
                })
                .catch(async () => {
                    isContinue = false;
                    await message.reply('You are not speed.');
                })
        }

        if (!isContinue) {
            return await message.reply('Okay, ain\'t nobody got time for that.');
        }

        let newCurrentTime = new Date(currentTime);
        newCurrentTime.setHours(newCurrentTime.getHours() + longRestLength.content[sheet.race]);

        let newTimeValues = {
            $set: {
                lastLongRest: currentTime,
                datetime: newCurrentTime
            }
        };

        await mongo.updateOne(database.collections.time, { characterName: characterName }, newTimeValues);

        const isBenefitable = isAtleastOneDayAfterLastLongRest && isEnoughHP;

        if (isBenefitable) {
            let newSheetValues = {};
            //check if any hit dices were spent
            if (sheet.hitDice.spent == 0) {
                newSheetValues = {
                    $set: {
                        currentHP: (isEnoughHP) ? sheet.maxHP : currentHP,
                        'spells.spellslots.expended.$[]': 0
                    }
                };
            } else {
                let hitDiceMissing = sheet.level - sheet.hitDice.count;
                let hitDiceRegain = Math.floor(hitDiceMissing / 2);
                if (hitDiceRegain == 0) {
                    hitDiceRegain++;
                }

                newSheetValues = {
                    $set: {
                        currentHP: (isEnoughHP) ? sheet.maxHP : currentHP,
                        'hitDice.spent': sheet.hitDice.spent - Number(hitDiceRegain),
                        'hitDice.count': sheet.hitDice.count + Number(hitDiceRegain),
                        'spells.spellslots.expended.$[]': 0
                    }
                };
            }

            await mongo.updateOne(database.collections.characters, { characterName: characterName }, newSheetValues);
        }

        return await message.reply('You have successfully completed a long rest. Good morning, sunshine! :sun_with_face:');
    }
}