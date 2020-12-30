const { database } = require('../../../../settings.json');
const { searchingObjType, NotFoundError, NegativeDamageError } = require('../../../err/errors');

module.exports = {
    name: 'damage',
    description: 'Deals a damage to the specified character.',
    args: {
        limitCount: true,
        specifics: [
            [{ type: 'characterName' }, { type: 'number' }]
        ]
    },
    isDead: (currentHP, maxHP) => currentHP <= -maxHP,
    isKnocked: (currentHP, maxHP) => currentHP < 0 && !this.isDead(currentHP, maxHP),
    async execute(_message, [ characterName, damageAmount, ...attackerArgs ], mongo, discordClient) {
        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.sheet, characterName);
        }

        damageAmount = Number(damageAmount);
        if (damageAmount < 0) {
            throw new NegativeDamageError();
        }

        const newCurrentHP = sheet.currentHP - damageAmount;
        let changedStatus = false;
        if (this.isKnocked(newCurrentHP, sheet.maxHP)) {
            changedStatus = true;
            discordClient.emit('gameEvent', 'knock', [characterName]);
        } else if (this.isDead(newCurrentHP, sheet.maxHP)) {
            changedStatus = true;
            discordClient.emit('gameEvent', 'death', [characterName]);
        }

        const newHP = {
            $set: {
                currentHP: (changedStatus) ? 0 : newCurrentHP,
            },
        };

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newHP);

        //log
        const attacker = attackerArgs.join(' ');
        discordClient.emit('sessionLog', 'damage', [characterName, damageAmount, attacker]);
    },
};
