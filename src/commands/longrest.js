const settings = require('../../settings.json');

module.exports = {
    name: 'longrest',
    args: false,
    description: 'Performs a long rest.',
    async execute(message, args, db, _client) {
        if (args[0] == 'help') {
            db.collection(settings.database.collections.helpEmbeds).find({
                commandName: this.name
            }).toArray(async (err, result) => {
                if (err) throw err;
                return await message.reply({
                    embed: result[0],
                });
            });
        } else {
            //get character name
            const resultName = await db.collection(settings.database.collections.players).find({
                discordID: message.author.id
            }).toArray();
            const characterName = resultName[0]["characters"][0];

            //get character time data, to check if long rest is available
            const resultTime = await db.collection(settings.database.collections.time).find({
                characterName: characterName
            }).toArray();
            const time = resultTime[0];

            //get longrest length
            const resultLongRestLength = await db.collection(settings.database.collections.data).find({
                name: 'LongRestLength'
            }).toArray();
            const longRestLength = resultLongRestLength[0]['content'];

            //get character sheet
            const resultSheet = await db.collection(settings.database.collections.characters).find({
                characterName: characterName,
            }).toArray();
            const sheet = resultSheet[0];

            const lastLongRest = new Date(time["lastLongRest"]);
            const currentTime = new Date(time["datetime"]);

            let isContinue = true;

            const isAtleastOneDayAfterLastLongRest = Math.abs(currentTime - lastLongRest) / 36e5 >= (24 - longRestLength[sheet['race']]);
            if (!isAtleastOneDayAfterLastLongRest) {
                let benefitableTime = new Date(lastLongRest);
                benefitableTime.setHours(benefitableTime.getHours() + (24 - longRestLength[sheet['race']]));
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

            let isEnoughHP = sheet["currentHP"] >= 1;
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
            newCurrentTime.setHours(newCurrentTime.getHours() + longRestLength[sheet['race']]);

            let newTimeValues = {
                $set: {
                    lastLongRest: currentTime,
                    datetime: newCurrentTime
                }
            };

            db.collection(settings.database.collections.time).updateOne({
                characterName: characterName
            }, newTimeValues, (err) => {
                if (err) throw err;
            });

            const isBenefitable = isAtleastOneDayAfterLastLongRest && isEnoughHP;

            if (isBenefitable) {
                let newSheetValues = {};
                //check if any hit dices were spent
                if (sheet['hitDice']['spent'] == 0) {
                    newSheetValues = {
                        $set: {
                            currentHP: (isEnoughHP) ? sheet["maxHP"] : currentHP,
                            "spells.spellslots.expended.$[]": 0
                        }
                    };
                } else {
                    let hitDiceMissing = sheet["level"] - sheet["hitDice"]["count"];
                    let hitDiceRegain = Math.floor(hitDiceMissing / 2);
                    if (hitDiceRegain == 0) {
                        hitDiceRegain++;
                    }

                    newSheetValues = {
                        $set: {
                            currentHP: (isEnoughHP) ? sheet["maxHP"] : currentHP,
                            "hitDice.spent": sheet["hitDice"]["spent"] - Number(hitDiceRegain),
                            "hitDice.count": sheet["hitDice"]["count"] + Number(hitDiceRegain),
                            "spells.spellslots.expended.$[]": 0
                        }
                    };
                }

                db.collection(settings.database.collections.characters).updateOne({
                    characterName: characterName
                }, newSheetValues, (err) => {
                    if (err) throw err;
                });
            }

            return await message.reply('You have successfully completed a long rest. Good morning, sunshine! :sun_with_face:');
        }
    }
}