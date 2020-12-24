const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { searchingObjType, NotFoundError, NegativeDamageError } = require('../err/errors');

module.exports = {
    name: 'damage',
    args: true,
    description: 'Deals a damage to the specified character.',
    isDead: function (currentHP, maxHP) {
        return currentHP <= -maxHP;
    },
    isKnocked: function (currentHP, maxHP) {
        return currentHP < 0 && !this.isDead(currentHP, maxHP);
    },
    async execute(_message, args, mongo, discordClient) {
        ArgsValidator.CheckCount(args, 2);
        let damage = args[1];
        ArgsValidator.TypeCheckOne(damage, type.numeric);

        //get character sheet
        const characterName = args[0];
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }

        damage = Number(args[1]);
        if (damage < 0) {
            throw new NegativeDamageError();
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
