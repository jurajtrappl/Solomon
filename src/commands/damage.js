const { database } = require('../../settings.json');
const { askedForHelp, printHelpEmbed } = require('../help');

module.exports = {
    name: 'damage',
    args: true,
    description: 'Damaging characters.',
    isDead: function (currentHP, maxHP) {
        return currentHP <= -maxHP;
    },
    isKnocked: function (currentHP, maxHP) {
        return currentHP < 0 && !this.isDead(currentHP, maxHP);
    },
    async execute(message, args, mongo, discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        //get character sheet
        const characterName = args[0];
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new Error(`${characterName} has not a character sheet`);
        }

        const damage = Number(args[1]);
        if (damage < 0) {
            return await message.reply('You sneaky thing.');
        }

        const newCurrentHP = sheet.currentHP - damage;
        let changedStatus = false;
        if (this.isKnocked(newCurrentHP, sheet.maxHP)) {
            changedStatus = true;
            discordClient.emit('playerKnocked', characterName);
        } else if (this.isDead(newCurrentHP, sheet.maxHP)) {
            changedStatus = true;
            discordClient.emit('playerDead', characterName);
        }

        const newHP = {
            $set: {
                currentHP: (changedStatus) ? 0 : newCurrentHP,
            },
        };

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHP);
    },
};
