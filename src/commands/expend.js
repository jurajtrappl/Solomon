const { askedForHelp, printHelpEmbed } = require('../output/help');
const { database } = require('../../settings.json');

module.exports = {
    name: 'expend',
    args: false,
    description: 'Expends one spell slot of the specified level.',
    async execute(message, args, mongo, _discordClient) {
        if (askedForHelp(args)) {
            return await printHelpEmbed(this.name, message, mongo);
        }

        const spellSlotLevel = args[0];
        if (isNaN(spellSlotLevel)) {
            throw new Error(`${spellSlotLevel} is not a number.`);
        }

        //get character name
        const playerData = await mongo.tryFind(database.collections.players, { discordID: message.author.id });
        if (!playerData) {
            throw new Error(`You do not have a character.`);
        }
        const [characterName] = playerData.characters;

        //get character sheet
        const sheet = await mongo.tryFind(database.collections.characters, { characterName: characterName });
        if (!sheet) {
            throw new Error(`${characterName} has not a character sheet`);
        }

        //check if the specified spell slot level is in range of the available character spell slots
        if (sheet.spells.spellslots.total.length < spellSlotLevel || spellSlotLevel <= 0) {
            throw new Error('You do not have a spell slot of this level.');
        }

        const totalSpellSlots = sheet.spells.spellslots.total[spellSlotLevel - 1];
        const spellSlotsLeft = totalSpellSlots - sheet.spells.spellslots.expended[spellSlotLevel - 1];

        if (spellSlotsLeft == 0) {
            throw new Error(`There is not a spell slot of the ${spellSlotLevel}. level anymore.`);
        }

        //expend one
        sheet.spells.spellslots.expended[spellSlotLevel - 1] += 1;

        if (sheet.spells.spellslots.expended[spellSlotLevel - 1] == totalSpellSlots) {
            await message.reply(`You have used all your ${spellSlotLevel}. level spell slots.`);
        }

        const newSpellSlotValues = {
            $set: {
                'spells.spellslots.expended': sheet.spells.spellslots.expended
            }
        }

        await mongo.updateOne(database.collections.characters, { characterName: characterName }, newSpellSlotValues);
    }
}