const { ArgsValidator, type } = require('../err/argsValidator');
const { database } = require('../../settings.json');
const { NotEnoughError, NotFoundError, searchingObjType } = require('../err/errors');

module.exports = {
    name: 'expend',
    args: true,
    description: 'Expends one spell slot of the specified level.',
    expendOne: (spellslots, spellSlotLevel) => {
        spellslots.expended[spellSlotLevel - 1] += 1;
    },
    async execute(message, args, mongo, discordClient) {
        let spellSlotLevel = args[0];
        ArgsValidator.typeCheckOne(spellSlotLevel, type.numeric);

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new NotFoundError(searchingObjType.player, message.author.id);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new NotFoundError(searchingObjType.character, characterName);
        }

        const spellslots = sheet.spells.spellslots;

        //check if the specified spell slot level is in range of the available character spell slots
        const maxSpellLevel = spellslots.total.length;
        if (maxSpellLevel < spellSlotLevel || spellSlotLevel <= 0) {
            throw new OutOfRangeError('Spell slot level', 1, maxSpellLevel);
        }
 
        const totalSpellSlotsOfLevel = spellslots.total[spellSlotLevel - 1];
        const spellSlotsLeft = totalSpellSlotsOfLevel - spellslots.expended[spellSlotLevel - 1];

        if (spellSlotsLeft == 0) {
            throw new NotEnoughError(`${spellSlotLevel}. level spell slots.`, 0, 1);
        }

        this.expendOne(spellslots, spellSlotLevel);

        if (spellslots.expended[spellSlotLevel - 1] == totalSpellSlotsOfLevel) {
            await message.reply(`You have used all your ${spellSlotLevel}. level spell slots.`);
        }

        const newSpellSlotValues = {
            $set: {
                'spells.spellslots.expended': spellslots.expended
            }
        }

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newSpellSlotValues);

        //log
        const spellName = args.slice(1).join(' ');
        discordClient.emit('sessionLog', 'expend', [ characterName, spellSlotLevel, spellName ]);
    }
}