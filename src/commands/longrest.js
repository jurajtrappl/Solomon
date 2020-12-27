const { dmID } = require('../../auth.json');
const { database } = require('../../settings.json');
const { NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'longrest',
    args: false,
    description: 'Performs a long rest.',
    yesNoReactions: {
        '👍': true, 
        '👎': false
    },
    REACTION_WAIT_TIME: 12000,
    MS_PER_HOUR: 36e5,
    dateDiffInHours: (firstDate, secondDate) => {
        const timeOne = Date.UTC(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate());
        const timeTwo = Date.UTC(secondDate.getFullYear(), secondDate.getMonth(), secondDate.getDate());

        return Math.floor((timeTwo - timeOne) / this.MS_PER_HOUR);
    },
    hoursReactions: [ '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣' ],
    async execute(message, _args, mongo, discordClient) {
        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const characterName = playerData.character;

        //get character time data, to check if long rest is available
        const time = await mongo.tryFind(database.collections.time, { characterName: characterName });
        if (!time) {
            throw new NotFoundError(searchingObjType.time, characterName);
        }

        //get longrest length
        const longRestLength = await mongo.tryFind(database.collections.data, { name: 'LongRestLength' });
        if (!longRestLength) {
            throw new NotFoundError(searchingObjType.dataFile, 'LongRestLength');
        }

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }

        const lastLongRest = new Date(time.lastLongRest);
        const currentTime = new Date(time.datetime);

        let isContinue = true; /* default */

        const isAtleastOneDayAfterLastLongRest = this.dateDiffInHours(lastLongRest, currentTime) >= (24 - longRestLength.content[sheet.race]);
        if (!isAtleastOneDayAfterLastLongRest) {
            let benefitableTime = new Date(lastLongRest);
            benefitableTime.setHours(benefitableTime.getHours() + (24 - longRestLength.content[sheet.race]));
            const botMessage = await message.reply(`you can not benefit from long rest until ${benefitableTime.toLocaleString()}. Do you still wish to do a long rest?`);

            for (let reaction of Object.keys(this.yesNoReactions)) {
                await botMessage.react(reaction);
            }

            await botMessage.awaitReactions((reaction, user) => user.id == message.author.id && Object.keys(this.yesNoReactions).includes(reaction.emoji.name), {
                dispose: true,
                time: this.REACTION_WAIT_TIME
            })
                .then(async collected => {
                    const choice = collected.last();
                    isContinue = this.yesNoReactions[choice.emoji.name];
                })
                .catch(async () => {
                    await message.reply('the reaction was not collected. Choosing the default option: not to continue.');
                })
        }

        if (!isContinue) return;

        isContinue = true; /* default */

        let isEnoughHP = sheet.currentHP >= 1;
        if (!isEnoughHP) {
            const botMessage = await message.reply('you can not benefit from long rest, because you have less than 1 HP. Do you still wish to do a long rest?');

            for (let reaction of Object.keys(this.yesNoReactions)) {
                await botMessage.react(reaction);
            }

            await botMessage.awaitReactions((reaction, user) => user.id == message.author.id && Object.keys(this.yesNoReactions).includes(reaction.emoji.name), {
                dispose: true,
                time: this.REACTION_WAIT_TIME
            })
                .then(async collected => {
                    const choice = collected.last();
                    isContinue = this.yesNoReactions[choice.emoji.name];
                })
                .catch(async () => {
                    await message.reply('the reaction was not collected. Choosing the default option: not to continue.');
                })
        }

        if (!isContinue) return;

        //get information about whether the long rest was successful or not
        let wasSuccessful = true;
        await message.channel.send(`Dungeon Master, was ${characterName}'s long rest successful?`)
            .then(async message => {
                //add yes / no
                for (let reaction of Object.keys(this.yesNoReactions)) {
                    await message.react(reaction);
                }

                //choose yes / no
                await message.awaitReactions((reaction, user) => user.id == dmID && Object.keys(this.yesNoReactions).includes(reaction.emoji.name), {
                    max: 1
                })
                    .then(async collected => {
                        const choice = collected.first();
                        wasSuccessful = this.yesNoReactions[choice.emoji.name];
                    });
            });

        let hours = 0; /* default */
        let newCurrentTime = new Date(currentTime);
        if (!wasSuccessful) {
            await message.channel.send(`After how many hours did ${characterName} wake up?`)
                .then(async message => {
                    for(let hourReaction of this.hoursReactions) {
                        await message.react(hourReaction);
                    }

                    await message.awaitReactions((reaction, user) => user.id == dmID && this.hoursReactions.includes(reaction.emoji.name), {
                        max: 1
                    })
                        .then(async collected => {
                            const hoursReaction = collected.first();
                            hours = this.hoursReactions.findIndex((element) => element === hoursReaction.emoji.name) + 1;
                        });
                });

            newCurrentTime.setHours(newCurrentTime.getHours() + hours);
        } else {
            hours = longRestLength.content[sheet.race];
            newCurrentTime.setHours(newCurrentTime.getHours() + hours);

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

                //await mongo.updateOne(database.collections.characters, { characterName: characterName }, newSheetValues);
            }
        }

        //update time
        let newTimeValues = {
            $set: {
                lastLongRest: currentTime,
                datetime: newCurrentTime
            }
        };

        //await mongo.updateOne(database.collections.time, { characterName: characterName }, newTimeValues);

        //log
        discordClient.emit('sessionLog', 'longrest', [ characterName, wasSuccessful, newCurrentTime, time.location, hours ]);
    }
}